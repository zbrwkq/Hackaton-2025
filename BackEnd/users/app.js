const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Charger les variables d'environnement
dotenv.config();

const app = express();



app.use(cors({ origin: "*" }));
app.use(express.json());


/* connectDB()
    .then(() => console.log("✅ Service Users connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));

// Route de test simple
app.get('/health', (req, res) => {
    res.json({ 
        status: 'User Service is running',
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error("❌ Erreur:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Service Users en écoute sur http://localhost:${PORT}`);
});
