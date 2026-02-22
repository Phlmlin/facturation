const { verifyAccessToken } = require('../config/jwt');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Accès non autorisé' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Vérifier si l'utilisateur existe toujours
        const userRes = await db.query('SELECT id, email FROM users WHERE id = $1', [decoded.id]);
        if (userRes.rowCount === 0) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        req.user = userRes.rows[0];
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
};

module.exports = authMiddleware;
