const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription
exports.register = async (req, res) => {
    try {
        const { username, mail, password, bio, profilePicture, banner } = req.body;
        
        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ mail });
        if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création du nouvel utilisateur
        const newUser = new User({
            username,
            mail, // Utiliser `mail` pour l'identification unique
            password: hashedPassword,
            bio,
            profilePicture,
            banner
        });

        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé avec succès !" });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// Connexion
exports.login = async (req, res) => {
    try {
        const { mail, password } = req.body;
        const user = await User.findOne({ mail });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, userId: user._id, username: user.username });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// Obtenir le profil de l'utilisateur
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
