const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const companyMiddleware = require('../middleware/company');

const router = express.Router();

router.use(auth);
router.use(companyMiddleware);

// @route   GET /api/products
// @desc    Liste des produits/services de l'entreprise
router.get('/', async (req, res) => {
    try {
        const products = await db.query(
            'SELECT * FROM products WHERE company_id = $1 ORDER BY name ASC',
            [req.company.id]
        );
        res.json(products.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});

// @route   POST /api/products
// @desc    Ajouter un produit/service
router.post('/', async (req, res) => {
    const { name, description, price, tax_rate } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });

    try {
        const newProduct = await db.query(
            'INSERT INTO products (company_id, name, description, price, tax_rate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.company.id, name, description, price || 0, tax_rate || 0]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
});

// @route   PUT /api/products/:id
// @desc    Modifier un produit/service
router.put('/:id', async (req, res) => {
    const { name, description, price, tax_rate } = req.body;
    try {
        const updateRes = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, tax_rate = $4, updated_at = NOW() WHERE id = $5 AND company_id = $6 RETURNING *',
            [name, description, price, tax_rate, req.params.id, req.company.id]
        );

        if (updateRes.rowCount === 0) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la modification du produit' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
router.delete('/:id', async (req, res) => {
    try {
        const deleteRes = await db.query(
            'DELETE FROM products WHERE id = $1 AND company_id = $2',
            [req.params.id, req.company.id]
        );
        if (deleteRes.rowCount === 0) return res.status(404).json({ error: 'Produit non trouvé' });
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    }
});

module.exports = router;
