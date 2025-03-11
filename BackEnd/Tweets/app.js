const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connexion MongoDB simple et directe
mongoose.connect("mongodb://127.0.0.1:27017/HackatonTwitter", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Service Tweets connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion:", err));

// Charger les modèles
require('../users/models/User');
require('./models/tweetModel');

// Route de test
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Tweet Service is running',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
const tweetRoutes = require("./routes/tweetRoutes");
app.use("/tweets", tweetRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.TWEET_SERVICE_PORT || 5002;
app.listen(PORT, () => {
    console.log(`🚀 Service Tweets en écoute sur http://localhost:${PORT}`);
});
