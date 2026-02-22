const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

// Toutes les routes ici nécessitent d'être connecté
router.use(auth);

// @route   GET /api/company
// @desc    Récupérer les infos de l'entreprise
router.get('/', companyMiddleware, (req, res) => {
    res.json(req.company);
});

// @route   PUT /api/company
// @desc    Mettre à jour les infos de l'entreprise
router.put('/', companyMiddleware, async (req, res) => {
    const { name, address, phone, email, nif, rccm, currency } = req.body;

    try {
        const updateRes = await db.query(
            `UPDATE companies SET 
        name = $1, address = $2, phone = $3, email = $4, 
        nif = $5, rccm = $6, currency = $7, updated_at = NOW() 
       WHERE id = $8 RETURNING *`,
            [name, address, phone, email, nif, rccm, currency, req.company.id]
        );

        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entreprise' });
    }
});

module.exports = router;
