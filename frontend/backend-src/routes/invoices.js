const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

router.use(auth);
router.use(companyMiddleware);

const { generateDocumentPDF } = require('../utils/pdf');

const getNextNumber = async (companyId, type) => {
    const prefix = type === 'proforma' ? 'PRO' : 'FAC';
    const year = new Date().getFullYear();
    const res = await db.query(
        "SELECT number FROM invoices WHERE company_id = $1 AND number LIKE $2 ORDER BY created_at DESC LIMIT 1",
        [companyId, `${prefix}-${year}-%`]
    );

    let nextId = 1;
    if (res.rowCount > 0) {
        const lastNumber = res.rows[0].number;
        const parts = lastNumber.split('-');
        nextId = parseInt(parts[2]) + 1;
    }

    return `${prefix}-${year}-${nextId.toString().padStart(4, '0')}`;
};

// @route   GET /api/invoices/:id/pdf
router.get('/:id/pdf', async (req, res) => {
    try {
        const invRes = await db.query(
            `SELECT i.*, c.name as client_name, c.address as client_address, c.phone as client_phone,
              comp.name as company_name, comp.address as company_address, comp.phone as company_phone, 
              comp.email as company_email, comp.nif as company_nif, comp.rccm as company_rccm, comp.currency
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       JOIN companies comp ON i.company_id = comp.id
       WHERE i.id = $1 AND i.company_id = $2`,
            [req.params.id, req.company.id]
        );

        if (invRes.rowCount === 0) return res.status(404).json({ error: 'Facture non trouvée' });

        const itemsRes = await db.query(
            'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC',
            [req.params.id]
        );

        const docData = {
            ...invRes.rows[0],
            items: itemsRes.rows,
            document_type: 'invoice'
        };

        const prefix = docData.type === 'proforma' ? 'PROFORMA' : 'FACTURE';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${prefix}_${docData.number}.pdf`);

        generateDocumentPDF(docData, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
});

// @route   GET /api/invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await db.query(
            `SELECT i.*, c.name as client_name 
       FROM invoices i 
       LEFT JOIN clients c ON i.client_id = c.id 
       WHERE i.company_id = $1 ORDER BY i.created_at DESC`,
            [req.company.id]
        );
        res.json(invoices.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
    }
});

// @route   POST /api/invoices
router.post('/', async (req, res) => {
    const { client_id, quote_id, type, due_date, items, notes } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const number = await getNextNumber(req.company.id, type);

        let subtotal = 0;
        let tax_amount = 0;
        items.forEach(item => {
            const line_total = item.quantity * item.unit_price;
            subtotal += line_total;
            tax_amount += line_total * (item.tax_rate / 100);
        });
        const total = subtotal + tax_amount;

        const invRes = await client.query(
            `INSERT INTO invoices (company_id, client_id, quote_id, number, type, due_date, subtotal, tax_amount, total, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.company.id, client_id, quote_id, number, type || 'invoice', due_date, subtotal, tax_amount, total, 'pending']
        );
        const invoiceId = invRes.rows[0].id;

        for (const item of items) {
            await client.query(
                `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, line_total) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [invoiceId, item.description, item.quantity, item.unit_price, item.tax_rate, (item.quantity * item.unit_price)]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(invRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création de la facture' });
    } finally {
        client.release();
    }
});

module.exports = router;
