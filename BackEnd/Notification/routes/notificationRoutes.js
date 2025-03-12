const express = require("express");
const router = express.Router();
const serviceNotification = require("../controllers/serviceNotification");

// Récupérer toutes les notifications d'un utilisateur
router.get("/:userId", serviceNotification.getNotifications);

// Marquer une notification comme lue
router.put("/:id/read", serviceNotification.markAsRead);

// Créer une notification (appelée depuis d'autres microservices)
router.post("/", serviceNotification.createNotification);

module.exports = router;
//hello
//izan
