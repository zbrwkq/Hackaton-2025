const express = require("express");
const router = express.Router();
const tweetController = require("../controllers/tweetController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Routes publiques
router.get("/", authMiddleware, tweetController.getAllTweets);
router.get("/:id", authMiddleware, tweetController.getTweetById);
router.get(
  "/hashtag/:hashtag",
  authMiddleware,
  tweetController.searchByHashtag
);

// Routes protégées (nécessitent une authentification)
router.post("/", authMiddleware, tweetController.createTweet);
router.post(
  "/feedback",
  [authMiddleware, upload.single("file")],
  tweetController.feedback
);
router.post("/fake-data", authMiddleware, tweetController.generateFakeData);
router.post("/:id/like", authMiddleware, tweetController.toggleLike);
router.delete("/:id", authMiddleware, tweetController.deleteTweet);
router.post("/:id/retweet", authMiddleware, tweetController.toggleRetweet);

// Nouvelle route pour les commentaires
router.post("/:id/comment", authMiddleware, tweetController.addComment);

// Nouvelles routes pour obtenir les interactions de l'utilisateur
router.get(
  "/user/comments",
  authMiddleware,
  tweetController.getUserCommentedTweets
);
router.get("/user/:id", authMiddleware, tweetController.getAllTweetsFromUser);
router.get("user/:id/")
router.get("/user/likes", authMiddleware, tweetController.getUserLikedTweets);
router.get(
  "/user/retweets",
  authMiddleware,
  tweetController.getUserRetweetedTweets
);

// Routes pour les tweets sauvegardés
router.post("/:id/save", authMiddleware, tweetController.toggleSaveTweet);
router.get("/user/saved", authMiddleware, tweetController.getSavedTweets);

module.exports = router;
