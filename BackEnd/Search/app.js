const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connexion MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/HackatonTwitter", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
})
.then(() => {
    console.log("✅ Service Search connecté à MongoDB");
    
    // Charger les schémas et modèles
    const tweetSchema = require('../Tweets/models/tweetModel').schema;
    const userSchema = require('../users/models/User').schema;
    
    // Créer les modèles localement
    mongoose.model('Tweet', tweetSchema);
    mongoose.model('User', userSchema);
    
    console.log("✅ Modèles chargés:", mongoose.modelNames());

    // Routes
    const searchRoutes = require("./routes/searchRoutes");
    app.use("/api/search", searchRoutes);
    
    const PORT = process.env.SEARCH_SERVICE_PORT || 6000;
    app.listen(PORT, () => {
        console.log(`🚀 Service Search en écoute sur http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error("❌ Erreur de connexion MongoDB:", err);
    process.exit(1);
});

// Route de test
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Search Service is running',
        dbStatus: mongoose.connection.readyState,
        availableModels: mongoose.modelNames()
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});
