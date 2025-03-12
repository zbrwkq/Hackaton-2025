const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../../users//middleware/authMiddleware');
const mongoose = require('mongoose');

// Route publique pour la santé du service
router.get('/health', (req, res) => {
    res.json({ 
        status: 'Search Service is running',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes protégées
router.get('/', authMiddleware, searchController.search);
router.get('/trends', authMiddleware, searchController.getTrends);

module.exports = router;