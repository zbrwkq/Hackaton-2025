const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MongoDB simple et directe
mongoose.connect("mongodb://127.0.0.1:27017/HackatonTwitter", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion:", err));

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