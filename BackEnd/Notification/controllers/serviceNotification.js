const Notification = require("../models/Notification");
const { sendNotification } = require("../socketManager"); // ✅ Importation depuis `socketManager.js`
const Tweet = require("../../Tweets/models/tweetModel"); // Import du modèle Tweet


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

exports.createNotification = async (req, res) => {
    try {
        const { userId, tweetId } = req.body; // L'utilisateur qui envoie la notif et l'ID du tweet

        // 🔍 Récupérer l'auteur du tweet pour envoyer la notif
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet non trouvé" });
        }

        const targetUserId = tweet.userId; // ✅ L'utilisateur qui a posté le tweet

        // ✅ Vérifier si l'utilisateur n'envoie pas une notif à lui-même
        if (targetUserId.toString() === userId.toString()) {
            return res.status(400).json({ message: "Impossible de s'envoyer une notification !" });
        }

        // ✅ Créer la notification
        const notification = new Notification({
            userId: targetUserId, // Le destinataire
            type: "mention",
            relatedUserId: userId, // L'émetteur
            tweetId: tweetId
        });

        await notification.save();

        // ✅ Envoyer la notification en temps réel via WebSocket
        sendNotification(targetUserId, notification);

        console.log(`📨 Notification envoyée à ${targetUserId}`);

        res.status(201).json(notification);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification :", error);
        res.status(500).json({ message: "Erreur lors de la création de la notification", error: error.message });
    }
};


/* exports.createNotification = async (req, res) => {
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
 */
