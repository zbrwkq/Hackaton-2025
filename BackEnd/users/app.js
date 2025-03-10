const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../Database/db.config");

// Charger les variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connexion à MongoDB avec la configuration existante
connectDB()
    .then(() => console.log("✅ Service Users connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));

// Route de test pour vérifier que le service fonctionne
app.get('/health', (req, res) => {
    res.json({ status: 'User Service is running' });
});

// Importer les routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.USER_SERVICE_PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Service Users en écoute sur http://localhost:${PORT}`);
});
