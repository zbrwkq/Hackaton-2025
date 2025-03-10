const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
//const connectDB = require("../Database/db.config"); // Import de la connexion MongoDB

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
//connectDB();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/HackatonTwitter", {});

// Initialisation d'Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Importer les routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Définition du port et lancement du serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
