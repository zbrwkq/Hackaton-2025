const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { initSocket } = require("./socketManager"); // ✅ Importer WebSockets

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialisation de WebSocket
initSocket(server); // ✅ On passe `server` à WebSocket

// Connexion MongoDB
mongoose
  .connect("mongodb://mongodb:27017/HackatonTwitter")
  .then(() => console.log("✅ Service Notifications connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// ✅ Importer les routes APRÈS l'initialisation
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

// Route de vérification de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Notification Service is running',
    message: 'Utilisez /notifications pour accéder aux notifications'
  });
});

// Démarrer le serveur HTTP + WebSocket
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5003;
server.listen(PORT, () => {
  console.log(
    `🚀 Service Notifications en écoute sur http://localhost:${PORT}`
  );
});

module.exports = { app, server };
