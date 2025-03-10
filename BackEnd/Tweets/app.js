const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
//const connectDB = require("../Database/db.config");

// Charger les variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connexion à MongoDB
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/HackatonTwitter", {});
/* connectDB()
    .then(() => console.log("✅ Service Tweets connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));
 */
// Routes de base pour vérifier que le service fonctionne
app.get('/health', (req, res) => {
    res.json({ status: 'Tweet Service is running' });
});

// Importer et utiliser les routes
const tweetRoutes = require("./routes/tweetRoutes");
app.use("/api/tweets", tweetRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.TWEET_SERVICE_PORT || 5002;
app.listen(PORT, () => {
    console.log(`🚀 Service Tweets en écoute sur http://localhost:${PORT}`);
});
