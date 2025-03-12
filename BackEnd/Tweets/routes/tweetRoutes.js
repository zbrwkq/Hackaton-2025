const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', authMiddleware, tweetController.getAllTweets);
router.get('/:id', authMiddleware, tweetController.getTweetById);
router.get('/hashtag/:hashtag', authMiddleware, tweetController.searchByHashtag);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware, tweetController.createTweet);
router.post('/:id/like', authMiddleware, tweetController.toggleLike);
router.delete('/:id', authMiddleware, tweetController.deleteTweet);
router.post('/', authMiddleware, tweetController.createTweet);
router.post('/:id/like', authMiddleware, tweetController.toggleLike);
router.post('/:id/retweet', authMiddleware, tweetController.toggleRetweet);
router.delete('/:id', authMiddleware, tweetController.deleteTweet);

// Nouvelle route pour les commentaires
router.post('/:id/comment', authMiddleware, tweetController.addComment);

// Nouvelles routes pour obtenir les interactions de l'utilisateur
router.get('/user/comments', authMiddleware, tweetController.getUserCommentedTweets);
router.get('/user/likes', authMiddleware, tweetController.getUserLikedTweets);
router.get('/user/retweets', authMiddleware, tweetController.getUserRetweetedTweets);

// Routes pour les tweets sauvegardés
router.post('/:id/save', authMiddleware, tweetController.toggleSaveTweet);
router.get('/user/saved', authMiddleware, tweetController.getSavedTweets);

module.exports = router;