const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

router.use(auth);
router.use(companyMiddleware);

// @route   GET /api/dashboard
router.get('/', async (req, res) => {
    try {
        const companyId = req.company.id;

        // 1. Totaux factures (tous types)
        const invoiceStats = await db.query(
            `SELECT 
        COUNT(*) filter (where type = 'invoice') as total_invoices,
        COUNT(*) filter (where type = 'proforma') as total_proforma,
        SUM(total) filter (where type = 'invoice' AND status = 'paid') as amount_paid,
        SUM(total) filter (where type = 'invoice' AND status = 'pending') as amount_pending,
        SUM(total) filter (where type = 'invoice' AND status = 'overdue') as amount_overdue
       FROM invoices WHERE company_id = $1`,
            [companyId]
        );

        // 2. Totaux devis
        const quoteStats = await db.query(
            `SELECT COUNT(*) as total_quotes FROM quotes WHERE company_id = $1`,
            [companyId]
        );

        // 3. Graphique mensuel (6 derniers mois)
        const chartData = await db.query(
            `SELECT 
        TO_CHAR(issue_date, 'YYYY-MM') as month,
        SUM(total) as total
       FROM invoices 
       WHERE company_id = $1 AND type = 'invoice' AND status = 'paid'
       AND issue_date > CURRENT_DATE - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month ASC`,
            [companyId]
        );

        res.json({
            invoices: invoiceStats.rows[0],
            quotes: quoteStats.rows[0],
            chart: chartData.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

module.exports = router;
