const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

//const connectDB = require("../Database/db.config");

// Charger les variables d'environnement
dotenv.config();


 const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/HackatonTwitter", {});
 
const app = express();



app.use(cors({ origin: "*" }));
app.use(express.json());


/* connectDB()
    .then(() => console.log("✅ Service Users connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion à MongoDB :", err));

app.get('/health', (req, res) => {
    res.json({ status: 'User Service is running' });
}); */


const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
});

// Démarrer le serveur
const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`🚀 Service Users en écoute sur http://localhost:${PORT}`);
});
