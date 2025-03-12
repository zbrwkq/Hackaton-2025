const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfilePicture, uploadBanner, uploadProfileFiles } = require("../middleware/uploadMiddleware");

router.post("/register", userController.register);
//router.post("/login", userController.login);
router.post("/login", (req, res, next) => {
    console.log("📡 Requête reçue sur /api/users/login"); // 🔥 Log pour voir si cette route est atteinte
    next();
}, userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

// Route pour mettre à jour le profil
router.put("/profile/update", authMiddleware, uploadProfileFiles, userController.updateProfile);

// Route spécifique pour upload photo de profil seulement
router.put("/profile/picture", authMiddleware, uploadProfilePicture, userController.updateProfile);

// Route spécifique pour upload bannière seulement
router.put("/profile/banner", authMiddleware, uploadBanner, userController.updateProfile);

// Routes simplifiées pour follow/unfollow et listes
router.post("/follow/:id", authMiddleware, userController.toggleFollow);
router.get("/followers", authMiddleware, userController.getFollowers);
router.get("/following", authMiddleware, userController.getFollowing);

module.exports = router;
