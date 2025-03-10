const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));

// Importer les routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
