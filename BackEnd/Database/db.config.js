const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("Déjà connecté à MongoDB");
            return mongoose.connection;
        }

        // Utiliser l'URI fourni par l'environnement Docker ou l'URI par défaut
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/HackatonTwitter';
        
        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        mongoose.connection.on('connected', () => {
            console.log('🎉 Mongoose connecté à MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('🔴 Erreur Mongoose:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('💔 Mongoose déconnecté de MongoDB');
        });

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        throw error;
    }
};

// Lancer la connexion à la base de données si ce fichier est exécuté directement
if (require.main === module) {
    connectDB()
        .then(() => console.log('Service de base de données démarré'))
        .catch(err => console.error('Échec du démarrage du service:', err));
}

module.exports = connectDB;

