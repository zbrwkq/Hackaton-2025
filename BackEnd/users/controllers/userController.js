const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription
exports.register = async (req, res) => {
    try {
        const { username, password, bio, profilePicture, banner } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Nom d'utilisateur déjà pris." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            bio,
            profilePicture,
            banner
        });

        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
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
