const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const auth = require('../../users/middleware/authMiddleware'); // Middleware d'authentification à implémenter

// Routes publiques
router.get('/', tweetController.getAllTweets);
router.get('/:id', tweetController.getTweetById);
router.get('/hashtag/:hashtag', tweetController.searchByHashtag);

// Routes protégées (nécessitent une authentification)
router.post('/', auth, tweetController.createTweet);
router.post('/:id/like', auth, tweetController.toggleLike);
router.post('/:id/retweet', auth, tweetController.toggleRetweet);
router.delete('/:id', auth, tweetController.deleteTweet);

module.exports = router;