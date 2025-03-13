const { Server } = require("socket.io");

const onlineUsers = new Map();
let io = null;

// ✅ Initialisation du WebSocket Server
const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }, // Autorise toutes les connexions
  });

  io.on("connection", (socket) => {
    console.log(`🔗 Nouvelle connexion WebSocket : ${socket.id}`);

    // ✅ Enregistrer un utilisateur connecté (Forcer l'ID en String)
    socket.on("register", (userId) => {
      const userKey = String(userId); // ✅ Forcer en String
      onlineUsers.set(userKey, socket.id);
      console.log(
        `✅ Utilisateur enregistré : ${userKey} avec Socket ID : ${socket.id}`
      );
      console.log("👥 Liste des utilisateurs connectés :", [
        ...onlineUsers.entries(),
      ]);
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

      console.log(
        `❌ Utilisateur déconnecté : ${disconnectedUser} (Socket ID : ${socket.id})`
      );
      console.log("👥 Liste mise à jour des utilisateurs connectés :", [
        ...onlineUsers.keys(),
      ]);
    });
  });
};

// ✅ Fonction pour envoyer une notification en temps réel
/* const sendNotification = (userId, notificationData) => {
  if (!io) {
    console.error("❌ WebSocket non initialisé !");
    return;
  }

  setTimeout(() => {
    // ✅ Ajout d'un délai pour s'assurer que `onlineUsers` est bien mis à jour
    const userKey = String(userId); // ✅ Forcer en String
    const socketId = onlineUsers.get(userKey);

    if (socketId) {
      console.log(
        `🚀 Envoi de la notification à ${userKey} via WebSocket (Socket ID : ${socketId}).`
      );
      console.log("📤 Données envoyées :", notificationData);
      io.to(socketId).emit("notification", notificationData);
    } else {
      console.log(`⚠️ L'utilisateur ${userKey} n'est pas connecté.`);
      console.log("👥 Liste actuelle des utilisateurs connectés :", [
        ...onlineUsers.entries(),
      ]);
    }
  }, 100); // ✅ Délai de 100ms pour éviter les conflits de timing.
}; */
const sendNotification = (userId, notificationData) => {
    if (!io) {
        console.error("❌ WebSocket non initialisé !");
        return;
    }

    setTimeout(() => {
        const userKey = String(userId);
        const socketId = onlineUsers.get(userKey);

        // ✅ Vérification et ajout forcé de `_id` si absent
        if (!notificationData._id) {
            console.error("🚨 ALERTE : La notification envoyée à WebSocket n'a pas d'_id !");
        }

        console.log(`📤 Données envoyées à ${userKey}:`, notificationData);

        if (socketId) {
            io.to(socketId).emit("notification", notificationData);
        } else {
            console.log(`⚠️ L'utilisateur ${userKey} n'est pas connecté.`);
        }
    }, 100);
};


const markNotificationAsRead = (userId, notificationId) => {
  const userKey = String(userId);
  const socketId = onlineUsers.get(userKey);

  if (socketId) {
    console.log(
      `📢 Notification ${notificationId} marquée comme lue pour ${userKey}`
    );
    io.to(socketId).emit("notificationRead", { notificationId });
  }
};
module.exports = { initSocket, sendNotification, markNotificationAsRead };
