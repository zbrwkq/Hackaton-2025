const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const authMiddleware = require('../../users/middleware/authMiddleware'); // Middleware d'authentification à implémenter

// Routes publiques
router.get('/', tweetController.getAllTweets);
router.get('/:id', tweetController.getTweetById);
router.get('/hashtag/:hashtag', tweetController.searchByHashtag);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, tweetController.createTweet);
router.post('/:id/like', authMiddleware, tweetController.toggleLike);
router.post('/:id/retweet', authMiddleware, tweetController.toggleRetweet);
router.delete('/:id', authMiddleware, tweetController.deleteTweet);

module.exports = router;