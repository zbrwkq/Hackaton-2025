const Notification = require("../models/Notification");
const { sendNotification } = require("../socketManager"); // ✅ Importation depuis `socketManager.js`

// Récupérer les notifications d'un utilisateur
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        if (!notifications) {
            return res.json([]); // ✅ Retourne un tableau vide au lieu de `null`
        }

        res.json(notifications);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des notifications:", error);
        res.status(500).json({ message: error.message });
    }
};


// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id, 
            { isRead: true }, 
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer une notification et envoyer via WebSocket
/* exports.createNotification = async (req, res) => {
    try {
        const { userId, type, relatedUserId, tweetId } = req.body;

        const notification = new Notification({ userId, type, relatedUserId, tweetId });
        await notification.save();

        // Envoyer la notification en temps réel via WebSocket
        if (io) {
            io.to(userId).emit("notification", notification);
            console.log(`📨 Notification envoyée en temps réel à ${userId}`);
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la notification", error: error.message });
    }
}; */

exports.createNotification = async (req, res) => {
    try {
        const { userId, type, relatedUserId, tweetId } = req.body;

        const notification = new Notification({ userId, type, relatedUserId, tweetId });
        await notification.save();

        // ✅ Envoyer la notification en temps réel via WebSocket
        sendNotification(userId, notification);

        console.log(`📨 Notification créée et envoyée en temps réel à ${userId}`);

        res.status(201).json(notification);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification:", error);
        res.status(500).json({ message: "Erreur lors de la création de la notification", error: error.message });
    }
};

