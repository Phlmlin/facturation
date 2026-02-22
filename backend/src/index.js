require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const clientRoutes = require('./routes/clients');
const productRoutes = require('./routes/products');
const quoteRoutes = require('./routes/quotes');
const invoiceRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes statiques pour les uploads (logo, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de base
app.get('/', (req, res) => {
    res.send('API SaaS Gestion Commerciale en ligne.');
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Une erreur interne est survenue' });
});

// For Vercel, export the app
module.exports = app;

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
}
