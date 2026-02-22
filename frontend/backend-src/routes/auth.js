const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur + sa compagnie par défaut
router.post('/register', [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères'),
    body('companyName').notEmpty().withMessage('Le nom de l\'entreprise est requis')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, companyName } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rowCount > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Transaction pour créer user + company
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const userRes = await client.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
                [email, passwordHash]
            );
            const userId = userRes.rows[0].id;

            await client.query(
                'INSERT INTO companies (user_id, name, email) VALUES ($1, $2, $3)',
                [userId, companyName, email]
            );

            await client.query('COMMIT');

            const accessToken = generateAccessToken({ id: userId });
            const refreshToken = generateRefreshToken({ id: userId });

            res.status(201).json({ accessToken, refreshToken });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// @route   POST /api/auth/login
// @desc    Authentifier l'utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rowCount === 0) {
            return res.status(400).json({ error: 'Identifiants invalides' });
        }

        const user = userRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Identifiants invalides' });
        }

        const accessToken = generateAccessToken({ id: user.id });
        const refreshToken = generateRefreshToken({ id: user.id });

        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// @route   POST /api/auth/refresh
// @desc    Rafraîchir les tokens
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Token requis' });

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken({ id: decoded.id });
        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ error: 'Refresh token invalide' });
    }
});

module.exports = router;
