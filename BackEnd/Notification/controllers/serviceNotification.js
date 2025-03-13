const Notification = require("../models/Notification");
const Tweet = require("../models/tweetModel"); // Importation du modèle Tweet
const User = require("../models/User"); // Importation du modèle User
const { sendNotification } = require("../socketManager");


// Créer une notification et envoyer au propriétaire du tweet
 const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId });

        console.log("🔍 Notifications récupérées :", notifications); // ✅ Ajout du log

        res.json(notifications);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des notifications :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


 const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée" });
        }

        notification.isRead = true;
        await notification.save();

        console.log(`✅ Notification ${notificationId} marquée comme lue.`);
        res.json({ message: "Notification marquée comme lue", notification });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la notification :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// ✅ Créer une notification et l'envoyer au propriétaire du tweet
 /* const createNotification = async (req, res) => {
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

 */


 const createNotification = async (req, res) => {
    try {
        console.log("📥 Données reçues pour la notification :", req.body); // ✅ Vérification

        const { type, relatedUserId, tweetId } = req.body;

        // ✅ Vérifier que le tweetId est bien fourni
        if (!tweetId) {
            console.error("🚨 ALERTE : tweetId est manquant !");
            return res.status(400).json({ message: "tweetId est requis pour créer une notification !" });
        }

        // ✅ Récupérer le propriétaire du tweet
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            console.error("❌ Erreur : Tweet non trouvé !");
            return res.status(404).json({ message: "Tweet non trouvé !" });
        }

        const userId = tweet.userId; // ✅ Le propriétaire du tweet devient le destinataire

        console.log(`✅ Notification envoyée au propriétaire du tweet : ${userId}`);

        // ✅ Créer la notification en base de données
        const notification = new Notification({
            userId, // 👈 On utilise le propriétaire du tweet
            type,
            relatedUserId, // Celui qui a interagi avec le tweet
            tweetId,
            isRead: false
        });

        await notification.save();

        console.log("✅ Notification créée :", notification);

        // ✅ Envoyer la notification via WebSocket
        sendNotification(userId, {
            _id: notification._id,
            type: notification.type,
            relatedUserId: notification.relatedUserId,
            tweetId: notification.tweetId,
            isRead: notification.isRead,
            createdAt: notification.createdAt
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification:", error);
        res.status(500).json({ message: "Erreur lors de la création de la notification" });
    }
};

// ✅ Correction de l'exportation
module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
