const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

// Routes simplifiées pour follow/unfollow et listes
router.post("/follow/:id", authMiddleware, userController.toggleFollow);
router.get("/followers", authMiddleware, userController.getFollowers);
router.get("/following", authMiddleware, userController.getFollowing);

module.exports = router;
