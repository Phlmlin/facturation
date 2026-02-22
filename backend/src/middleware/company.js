const db = require('../config/db');

const companyMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        // Récupérer la compagnie liée à l'utilisateur
        const companyRes = await db.query('SELECT * FROM companies WHERE user_id = $1', [req.user.id]);

        if (companyRes.rowCount === 0) {
            return res.status(404).json({ error: 'Profil entreprise non configuré' });
        }

        req.company = companyRes.rows[0];
        next();
    } catch (err) {
        console.error('Company Middleware Error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'entreprise' });
    }
};

module.exports = companyMiddleware;
