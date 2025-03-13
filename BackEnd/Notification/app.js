const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { initSocket, getStatus } = require("./socketManager"); // ✅ Importer WebSockets

// Charger les variables d'environnement
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuration CORS améliorée
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json());

// Initialisation de WebSocket
console.log("🔄 Démarrage du serveur WebSocket...");
initSocket(server); // ✅ On passe `server` à WebSocket

// Connexion MongoDB
mongoose
  .connect("mongodb://mongodb:27017/HackatonTwitter")
  .then(() => console.log("✅ Service Notifications connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Notification Service is running',
    message: 'Utilisez /notifications pour accéder aux notifications, /socket-health pour vérifier WebSocket'
  });
});

// Route de vérification de santé standard
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Notification Service is running',
    message: 'Utilisez /notifications pour accéder aux notifications'
  });
});

// Route de vérification de santé pour WebSocket
app.get('/socket-health', (req, res) => {
  res.status(200).json({
    status: 'WebSocket is running',
    webSocketStatus: getStatus()
  });
});

// ✅ Importer les routes APRÈS l'initialisation
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

// Démarrer le serveur HTTP + WebSocket
const PORT = 5003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `🚀 Service Notifications en écoute sur http://localhost:${PORT}`
  );
  console.log(`📱 WebSocket Socket.IO configuré et prêt`);
});

module.exports = { app, server };
