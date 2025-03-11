const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", userController.register);
//router.post("/login", userController.login);
router.post("/login", (req, res, next) => {
    console.log("📡 Requête reçue sur /api/users/login"); // 🔥 Log pour voir si cette route est atteinte
    next();
}, userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
