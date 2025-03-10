const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger les variables d’environnement
dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect("mongodb://localhost:27017/HackatonTwitter", {
      
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Exit avec échec
  }
};

module.exports = connectDB;
