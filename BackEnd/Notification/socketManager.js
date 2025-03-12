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

        socket.on("register", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`✅ Utilisateur connecté : ${userId}`);
            console.log("👥 Liste des utilisateurs connectés :", [...onlineUsers.keys()]);
        });

        socket.on("disconnect", () => {
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    console.log(`❌ Utilisateur déconnecté : ${userId}`);
                    onlineUsers.delete(userId);
                }
            });
            console.log("👥 Liste mise à jour des utilisateurs connectés :", [...onlineUsers.keys()]);
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
        console.log(`⚠️ L'utilisateur ${userId} n'est pas connecté. Impossible d'envoyer en temps réel.`);
        console.log("👥 Utilisateurs connectés actuellement :", [...onlineUsers.keys()]);
    }
};

module.exports = { initSocket, sendNotification };
