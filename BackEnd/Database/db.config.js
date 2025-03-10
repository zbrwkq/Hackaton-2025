const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les variables d’environnement
dotenv.config();

const connectDB = async () => {
    try {
        // Utilisez 127.0.0.1 au lieu de localhost
        const connection = await mongoose.connect('mongodb://127.0.0.1:27017/HackatonTwitter', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

