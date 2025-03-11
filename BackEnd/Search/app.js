const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Configuration MongoDB avec timeouts plus longs
mongoose.connect("mongodb://127.0.0.1:27017/HackatonTwitter", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000
})
.then(() => {
    console.log("✅ Service Search connecté à MongoDB");
    
    // Configurer les événements de connexion
    mongoose.connection.on('error', err => {
        console.error('Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB déconnecté');
    });
})
.catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// Charger les modèles existants
require('../users/models/User');
require('../Tweets/models/tweetModel');

// Route de test publique
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Search Service is running',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.SEARCH_SERVICE_PORT || 6000;
app.listen(PORT, () => {
    console.log(`🚀 Service Search en écoute sur http://localhost:${PORT}`);
});

// Gérer la fermeture propre
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB déconnecté proprement');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la fermeture:', err);
        process.exit(1);
    }
});
