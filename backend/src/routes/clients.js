const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

router.use(auth);
router.use(companyMiddleware);

// @route   GET /api/clients
// @desc    Liste des clients de l'entreprise
router.get('/', async (req, res) => {
    try {
        const clients = await db.query(
            'SELECT * FROM clients WHERE company_id = $1 ORDER BY name ASC',
            [req.company.id]
        );
        res.json(clients.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
    }
});

// @route   POST /api/clients
// @desc    Ajouter un client
router.post('/', async (req, res) => {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });

    try {
        const newClient = await db.query(
            'INSERT INTO clients (company_id, name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.company.id, name, email, phone, address]
        );
        res.status(201).json(newClient.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du client' });
    }
});

// @route   PUT /api/clients/:id
// @desc    Modifier un client
router.put('/:id', async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        const updateRes = await db.query(
            'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, updated_at = NOW() WHERE id = $5 AND company_id = $6 RETURNING *',
            [name, email, phone, address, req.params.id, req.company.id]
        );

        if (updateRes.rowCount === 0) return res.status(404).json({ error: 'Client non trouvé' });
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la modification du client' });
    }
});

// @route   DELETE /api/clients/:id
// @desc    Supprimer un client
router.delete('/:id', async (req, res) => {
    try {
        const deleteRes = await db.query(
            'DELETE FROM clients WHERE id = $1 AND company_id = $2',
            [req.params.id, req.company.id]
        );
        if (deleteRes.rowCount === 0) return res.status(404).json({ error: 'Client non trouvé' });
        res.json({ message: 'Client supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression du client' });
    }
});

module.exports = router;
