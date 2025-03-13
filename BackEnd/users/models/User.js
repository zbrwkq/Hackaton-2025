const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Nom d'affichage (pas unique)
    mail: { type: String, required: true, unique: true }, // Adresse email unique
    bio: { type: String, default: "" },
    profilePicture: { 
        type: String, 
        default: "",
        validate: {
            validator: function(url) {
                // Accepte à la fois les URLs standards et les données base64
                return url === "" || 
                       /^(http|https):\/\/[^ "]+$/.test(url) || 
                       /^\/uploads\/profiles\/[^ "]+$/.test(url) || 
                       /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(url);
            },
            message: 'URL de photo de profil invalide'
        }
    },
    banner: { 
        type: String, 
        default: "",
        validate: {
            validator: function(url) {
                // Accepte à la fois les URLs standards et les données base64
                return url === "" || 
                       /^(http|https):\/\/[^ "]+$/.test(url) || 
                       /^\/uploads\/banners\/[^ "]+$/.test(url) || 
                       /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(url);
            },
            message: 'URL de bannière invalide'
        }
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Exporter le modèle
module.exports = mongoose.model("User", UserSchema);
