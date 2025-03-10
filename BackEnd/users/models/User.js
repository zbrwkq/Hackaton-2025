const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Nom d'affichage (pas unique)
    mail: { type: String, required: true, unique: true }, // Adresse email unique
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    banner: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Exporter le modèle
module.exports = mongoose.model("User", UserSchema);
