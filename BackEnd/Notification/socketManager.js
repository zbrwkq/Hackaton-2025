const { Server } = require("socket.io");

const onlineUsers = new Map();
let io = null;

// ✅ Initialisation du WebSocket Server
const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" } // Autorise toutes les connexions
    });

    io.on("connection", (socket) => {
        console.log(`🔗 Nouvelle connexion WebSocket : ${socket.id}`);

        // ✅ Enregistrer un utilisateur connecté (Forcer l'ID en String)
        socket.on("register", (userId) => {
            const userKey = String(userId); // ✅ Forcer en String
            onlineUsers.set(userKey, socket.id);
            console.log(`✅ Utilisateur enregistré : ${userKey} avec Socket ID : ${socket.id}`);
            console.log("👥 Liste des utilisateurs connectés :", [...onlineUsers.entries()]);
        });

        // ✅ Gérer la déconnexion d'un utilisateur
        socket.on("disconnect", () => {
            let disconnectedUser = null;
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    disconnectedUser = userId;
                    onlineUsers.delete(userId);
                }
            });

            console.log(`❌ Utilisateur déconnecté : ${disconnectedUser} (Socket ID : ${socket.id})`);
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

    setTimeout(() => { // ✅ Ajout d'un délai pour s'assurer que `onlineUsers` est bien mis à jour
        const userKey = String(userId); // ✅ Forcer en String
        const socketId = onlineUsers.get(userKey);
        
        if (socketId) {
            console.log(`🚀 Envoi de la notification à ${userKey} via WebSocket (Socket ID : ${socketId}).`);
            console.log("📤 Données envoyées :", notificationData);
            io.to(socketId).emit("notification", notificationData);
        } else {
            console.log(`⚠️ L'utilisateur ${userKey} n'est pas connecté.`);
            console.log("👥 Liste actuelle des utilisateurs connectés :", [...onlineUsers.entries()]);
        }
    }, 100); // ✅ Délai de 100ms pour éviter les conflits de timing.
};

// ✅ Exporter les fonctions pour utilisation dans `server.js` et `serviceNotification.js`
module.exports = { initSocket, sendNotification };
