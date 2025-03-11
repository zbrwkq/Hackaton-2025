const { Server } = require("socket.io");

const onlineUsers = new Map();
let io = null;

// Initialisation de WebSocket
const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log(`🔗 Nouvelle connexion WebSocket : ${socket.id}`);

        // Enregistrer un utilisateur connecté
        socket.on("register", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`✅ Utilisateur connecté : ${userId}`);
        });

        // Gérer la déconnexion
        socket.on("disconnect", () => {
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    console.log(`❌ Utilisateur déconnecté : ${userId}`);
                    onlineUsers.delete(userId);
                }
            });
        });
    });
};

// ✅ Fonction pour envoyer une notification en temps réel
const sendNotification = (userId, notificationData) => {
    if (!io) {
        console.error("❌ WebSocket non initialisé !");
        return;
    }
    
    const socketId = onlineUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit("notification", notificationData);
        console.log(`📨 Notification envoyée à ${userId}`);
    } else {
        console.log(`⚠️ L'utilisateur ${userId} n'est pas connecté.`);
    }
};

module.exports = { initSocket, sendNotification };
