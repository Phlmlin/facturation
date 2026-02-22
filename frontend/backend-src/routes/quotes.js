const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

router.use(auth);
router.use(companyMiddleware);

const { generateDocumentPDF } = require('../utils/pdf');

// Helper helper pour générer le prochain numéro (ex: DEV-2024-0001)
const getNextNumber = async (companyId) => {
    const year = new Date().getFullYear();
    const res = await db.query(
        "SELECT number FROM quotes WHERE company_id = $1 AND number LIKE $2 ORDER BY created_at DESC LIMIT 1",
        [companyId, `DEV-${year}-%`]
    );

    let nextId = 1;
    if (res.rowCount > 0) {
        const lastNumber = res.rows[0].number;
        const parts = lastNumber.split('-');
        nextId = parseInt(parts[2]) + 1;
    }

    return `DEV-${year}-${nextId.toString().padStart(4, '0')}`;
};

// @route   GET /api/quotes/:id/pdf
router.get('/:id/pdf', async (req, res) => {
    try {
        const quoteRes = await db.query(
            `SELECT q.*, c.name as client_name, c.address as client_address, c.phone as client_phone,
              comp.name as company_name, comp.address as company_address, comp.phone as company_phone, 
              comp.email as company_email, comp.nif as company_nif, comp.rccm as company_rccm, comp.currency
       FROM quotes q
       LEFT JOIN clients c ON q.client_id = c.id
       JOIN companies comp ON q.company_id = comp.id
       WHERE q.id = $1 AND q.company_id = $2`,
            [req.params.id, req.company.id]
        );

        if (quoteRes.rowCount === 0) return res.status(404).json({ error: 'Devis non trouvé' });

        const itemsRes = await db.query(
            'SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY sort_order ASC',
            [req.params.id]
        );

        const docData = {
            ...quoteRes.rows[0],
            items: itemsRes.rows,
            document_type: 'quote'
        };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=DEVIS_${docData.number}.pdf`);

        generateDocumentPDF(docData, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
});

// @route   GET /api/quotes
router.get('/', async (req, res) => {
    try {
        const quotes = await db.query(
            `SELECT q.*, c.name as client_name 
       FROM quotes q 
       LEFT JOIN clients c ON q.client_id = c.id 
       WHERE q.company_id = $1 ORDER BY q.created_at DESC`,
            [req.company.id]
        );
        res.json(quotes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
    }
});

// @route   POST /api/quotes
router.post('/', async (req, res) => {
    const { client_id, expiry_date, items, notes } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Un devis doit contenir au moins un article' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const number = await getNextNumber(req.company.id);

        // Calculs totaux
        let subtotal = 0;
        let tax_amount = 0;
        items.forEach(item => {
            const line_total = item.quantity * item.unit_price;
            subtotal += line_total;
            tax_amount += line_total * (item.tax_rate / 100);
        });
        const total = subtotal + tax_amount;

        const quoteRes = await client.query(
            `INSERT INTO quotes (company_id, client_id, number, expiry_date, subtotal, tax_amount, total, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.company.id, client_id, number, expiry_date, subtotal, tax_amount, total, notes]
        );
        const quoteId = quoteRes.rows[0].id;

        // Insertion des items
        for (const item of items) {
            await client.query(
                `INSERT INTO quote_items (quote_id, description, quantity, unit_price, tax_rate, line_total) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [quoteId, item.description, item.quantity, item.unit_price, item.tax_rate, (item.quantity * item.unit_price)]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(quoteRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du devis' });
    } finally {
        client.release();
    }
});

module.exports = router;
