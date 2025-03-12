const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../../users/middleware/authMiddleware');
const mongoose = require('mongoose');

// Route publique pour vérifier l'état du service et de la base de données
router.get('/health', (req, res) => {
    res.json({ 
        status: 'Search Service is running',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes protégées nécessitant une authentification (token JWT)

/*
 * Route 1: Recherche générale
 * GET /api/search?q=javascript
 * Description: Recherche dans tous les types (tweets, users, hashtags)
 * Paramètres:
 * - q: terme de recherche
 * Exemple: http://localhost:6000/api/search?q=javascript
 */
router.get('/', authMiddleware, searchController.search);

/*
 * Route 2: Recherche par type spécifique
 * GET /api/search?q=javascript&type=tweets
 * Description: Recherche uniquement dans les tweets
 * Paramètres:
 * - q: terme de recherche
 * - type: 'tweets', 'users', ou 'hashtags'
 * Exemple: http://localhost:6000/api/search?q=javascript&type=tweets
 */

/*
 * Route 3: Recherche avec filtres de date
 * GET /api/search?q=javascript&startDate=2024-01-01&endDate=2024-01-08
 * Description: Recherche avec une période spécifique
 * Paramètres:
 * - q: terme de recherche
 * - startDate: date de début (YYYY-MM-DD)
 * - endDate: date de fin (YYYY-MM-DD)
 * Exemple: http://localhost:6000/api/search?q=javascript&startDate=2024-01-01&endDate=2024-01-08
 */

/*
 * Route 4: Recherche triée par popularité
 * GET /api/search?q=javascript&sortBy=popular
 * Description: Trie les résultats par popularité (likes, retweets)
 * Paramètres:
 * - q: terme de recherche
 * - sortBy: 'popular' ou 'recent'
 * Exemple: http://localhost:6000/api/search?q=javascript&sortBy=popular
 */

/*
 * Route 5: Recherche de hashtags populaires
 * GET /api/search?type=hashtags&sortBy=popular
 * Description: Trouve les hashtags les plus utilisés
 * Paramètres:
 * - type: 'hashtags'
 * - sortBy: 'popular'
 * Exemple: http://localhost:6000/api/search?type=hashtags&sortBy=popular
 */

/*
 * Route 6: Recherche d'utilisateurs
 * GET /api/search?q=john&type=users
 * Description: Recherche des utilisateurs par username ou bio
 * Paramètres:
 * - q: terme de recherche
 * - type: 'users'
 * Exemple: http://localhost:6000/api/search?q=john&type=users
 */

/*
 * Route 7: Recherche combinée avec limite
 * GET /api/search?q=coding&type=tweets&startDate=2024-01-01&sortBy=popular&limit=20
 * Description: Recherche complète avec tous les paramètres
 * Paramètres:
 * - q: terme de recherche
 * - type: type de recherche
 * - startDate: date de début
 * - sortBy: type de tri
 * - limit: nombre maximum de résultats
 * Exemple: http://localhost:6000/api/search?q=coding&type=tweets&startDate=2024-01-01&sortBy=popular&limit=20
 */

/*
 * Pour toutes les routes protégées:
 * Header requis: Authorization: Bearer votre_token
 * 
 * Paramètres communs optionnels:
 * - q: terme de recherche
 * - type: 'all' (défaut), 'tweets', 'users', 'hashtags'
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 * - sortBy: 'recent' (défaut), 'popular'
 * - limit: nombre de résultats (défaut: 10)
 */

module.exports = router;