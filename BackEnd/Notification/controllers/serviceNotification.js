const Notification = require("../models/Notification");
const Tweet = require("../models/tweetModel"); // Importation du modèle Tweet
const User = require("../models/User"); // Importation du modèle User
const { sendNotification } = require("../socketManager");


// Créer une notification et envoyer au propriétaire du tweet
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications || []);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des notifications:", error);
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id, { isRead: true }, { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification non trouvée" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* const createNotification = async (req, res) => {
    try {
        const { type, relatedUserId, tweetId } = req.body;

        const tweet = await Tweet.findById(tweetId).populate("userId", "username");
        if (!tweet) return res.status(404).json({ message: "Tweet non trouvé" });

        const userId = tweet.userId._id;
        const sender = await User.findById(relatedUserId).select("username");

        const notification = new Notification({ userId, type, relatedUserId, tweetId });
        await notification.save();

        sendNotification(userId, {
            type,
            senderUsername: sender.username,
            tweetId
        });

        console.log(`📨 Notification envoyée à ${userId}`);
        res.status(201).json(notification);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}; */

// ✅ Créer une notification et l'envoyer au propriétaire du tweet
 const createNotification = async (req, res) => {
    try {
        const { type, relatedUserId, tweetId } = req.body;

        // 🔍 Vérifier si le tweet existe et récupérer le propriétaire du tweet
        const tweet = await Tweet.findById(tweetId).populate("userId", "username");
        if (!tweet) return res.status(404).json({ message: "Tweet non trouvé" });

        const ownerId = tweet.userId._id; // ✅ Récupération de l'ID du propriétaire du tweet
        const sender = await User.findById(relatedUserId).select("username"); // ✅ Récupération du username de l'envoyeur

        // 🔥 Enregistrer la notification en base de données
        const notification = new Notification({ 
            userId: ownerId, 
            type, 
            relatedUserId, 
            tweetId 
        });
        await notification.save();

        // 🔥 Vérifier si le propriétaire du tweet est connecté
        sendNotification(ownerId, {
            type,
            senderUsername: sender.username,
            tweetId
        });

        console.log(`📨 Notification envoyée en temps réel à ${ownerId} (propriétaire du tweet)`);

        res.status(201).json(notification);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// ✅ Correction de l'exportation
module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
