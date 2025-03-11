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

// Suivre/Ne plus suivre un utilisateur
exports.toggleFollow = async (req, res) => {
    try {
        const userToFollowId = req.params.id;
        const currentUserId = req.user.userId;

        // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
        if (userToFollowId === currentUserId) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même" });
        }

        // Vérifier que l'utilisateur à suivre existe
        const userToFollow = await User.findById(userToFollowId);
        if (!userToFollow) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const currentUser = await User.findById(currentUserId);

        // Vérifier si déjà suivi
        const isFollowing = currentUser.following.includes(userToFollowId);

        if (isFollowing) {
            // Retirer des following/followers
            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: userToFollowId }
            });
            await User.findByIdAndUpdate(userToFollowId, {
                $pull: { followers: currentUserId }
            });

            res.json({ 
                message: "Vous ne suivez plus cet utilisateur",
                isFollowing: false
            });
        } else {
            // Ajouter aux following/followers
            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: userToFollowId }
            });
            await User.findByIdAndUpdate(userToFollowId, {
                $addToSet: { followers: currentUserId }
            });

            res.json({ 
                message: "Vous suivez maintenant cet utilisateur",
                isFollowing: true
            });
        }
    } catch (error) {
        console.error("Erreur follow:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Obtenir la liste des followers
exports.getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('followers', 'username profilePicture bio')
            .select('followers');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({
            success: true,
            count: user.followers.length,
            followers: user.followers
        });
    } catch (error) {
        console.error("Erreur récupération followers:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des followers",
            error: error.message 
        });
    }
};

// Obtenir la liste des following
exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('following', 'username profilePicture bio')
            .select('following');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({
            success: true,
            count: user.following.length,
            following: user.following
        });
    } catch (error) {
        console.error("Erreur récupération following:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des following",
            error: error.message 
        });
    }
};
