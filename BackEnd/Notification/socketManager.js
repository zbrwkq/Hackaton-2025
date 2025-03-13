const { Server } = require("socket.io");

const onlineUsers = new Map();
let io = null;

// ✅ Initialisation du WebSocket Server - Amélioré
const initSocket = (server) => {
    console.log("🔧 Initialisation du serveur WebSocket Socket.IO...");
    
    io = new Server(server, {
        cors: { 
            origin: "*", // Autorise toutes les connexions
            methods: ["GET", "POST"],
            credentials: true
        },
        allowEIO3: true, // Compatible avec la version 3 du protocole
        pingTimeout: 30000, // Timeout pour les pings
        pingInterval: 10000, // Intervalle pour les pings
        transports: ['polling', 'websocket'], // Autoriser polling et websocket
        path: '/socket.io', // Chemin explicite
    });
    
    console.log("🔧 Configuration du serveur WebSocket terminée");

    // Événement de connexion
    io.on("connection", (socket) => {
        console.log(`🔗 Nouvelle connexion WebSocket : ${socket.id}`);
        console.log(`🔍 Détails de la connexion: transport=${socket.conn.transport.name}, adresse=${socket.handshake.address}`);
        console.log(`🔍 Headers: ${JSON.stringify(socket.handshake.headers)}`);

        // Événement de déconnexion du socket
        socket.on("disconnect", (reason) => {
            console.log(`🔌 Socket déconnecté : ${socket.id}, raison: ${reason}`);
            
            // Trouver et supprimer l'utilisateur déconnecté
            let disconnectedUser = null;
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    disconnectedUser = userId;
                    onlineUsers.delete(userId);
                }
            });

            if (disconnectedUser) {
                console.log(`❌ Utilisateur déconnecté : ${disconnectedUser} (Socket ID : ${socket.id})`);
            } else {
                console.log(`❌ Socket déconnecté sans utilisateur associé: ${socket.id}`);
            }
            
            console.log("👥 Liste mise à jour des utilisateurs connectés :", [...onlineUsers.keys()]);
        });

        // ✅ Enregistrer un utilisateur connecté (Forcer l'ID en String)
        socket.on("register", (userId) => {
            if (!userId) {
                console.error("❌ Tentative d'enregistrement avec un ID utilisateur vide ou null");
                return;
            }
            
            const userKey = String(userId); // ✅ Forcer en String
            onlineUsers.set(userKey, socket.id);
            
            console.log(`✅ Utilisateur enregistré : ${userKey} avec Socket ID : ${socket.id}`);
            console.log("👥 Liste des utilisateurs connectés :", [...onlineUsers.entries()]);
            
            // Envoyer une confirmation au client
            socket.emit("register_confirm", { userId: userKey, status: "success" });
        });

        // Event personnalisé pour tester la connexion
        socket.on("ping", (data) => {
            console.log(`📢 Ping reçu de ${socket.id}:`, data);
            socket.emit("pong", { time: new Date().toISOString(), received: data });
        });

        // Écouter les erreurs du socket
        socket.on("error", (error) => {
            console.error(`❌ Erreur Socket.IO (${socket.id}):`, error);
        });
    });
    
    // Écouter les erreurs du serveur Socket.IO
    io.engine.on("connection_error", (err) => {
        console.error("❌ Erreur de connexion Socket.IO:", err);
    });
};

// ✅ Fonction pour envoyer une notification en temps réel
const sendNotification = (userId, notificationData) => {
    if (!io) {
        console.error("❌ WebSocket non initialisé !");
        return;
    }

    if (!userId) {
        console.error("❌ UserID non spécifié pour l'envoi de notification!");
        return;
    }

    setTimeout(() => { // ✅ Ajout d'un délai pour s'assurer que `onlineUsers` est bien mis à jour
        const userKey = String(userId); // ✅ Forcer en String
        const socketId = onlineUsers.get(userKey);
        
        if (socketId) {
            console.log(`🚀 Envoi de la notification à ${userKey} via WebSocket (Socket ID : ${socketId}).`);
            console.log("📤 Données envoyées :", notificationData);
            
            try {
                io.to(socketId).emit("notification", notificationData);
                console.log(`✅ Notification envoyée à ${userKey}`);
            } catch (error) {
                console.error(`❌ Erreur lors de l'envoi de la notification à ${userKey}:`, error);
            }
        } else {
            console.log(`⚠️ L'utilisateur ${userKey} n'est pas connecté.`);
            console.log("👥 Liste actuelle des utilisateurs connectés :", [...onlineUsers.entries()]);
        }
    }, 100); // ✅ Délai de 100ms pour éviter les conflits de timing.
};

// ✅ Pour tester l'état du serveur WebSocket
const getStatus = () => {
    return {
        initialized: io !== null,
        connectedClients: io ? io.engine.clientsCount : 0,
        onlineUsers: [...onlineUsers.entries()]
    };
};

// ✅ Exporter les fonctions pour utilisation dans `server.js` et `serviceNotification.js`
module.exports = { initSocket, sendNotification, getStatus };
