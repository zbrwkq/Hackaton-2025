const mongoose = require('mongoose');
const Tweet = require('../models/tweetModel');

// Définir le schéma User directement dans le contrôleur des tweets
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    banner: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Créer le modèle User s'il n'existe pas déjà
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Créer un nouveau tweet
exports.createTweet = async (req, res) => {
    try {
        const { content, media, hashtags, mentions } = req.body;
        
        // Vérification des mentions
        if (mentions && mentions.length > 0) {
            // Vérifier que les utilisateurs mentionnés existent
            const mentionnedUsers = await User.find({ _id: { $in: mentions } });
            if (mentionnedUsers.length !== mentions.length) {
                return res.status(400).json({ message: "Un ou plusieurs utilisateurs mentionnés n'existent pas" });
            }
        }

        const tweet = new Tweet({
            userId: req.user.userId,
            content,
            media: media || [],
            hashtags: hashtags || [],
            mentions: mentions || []
        });

        await tweet.save();

        // Populate complet
        const populatedTweet = await Tweet.findById(tweet._id)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username profilePicture')
            .exec();

        res.status(201).json({
            message: "Tweet créé avec succès",
            tweet: populatedTweet
        });
    } catch (error) {
        console.error("Erreur création tweet:", error);
        res.status(400).json({ 
            message: "Erreur lors de la création du tweet",
            error: error.message 
        });
    }
};

// Obtenir tous les tweets
exports.getAllTweets = async (req, res) => {
    try {
        const tweets = await Tweet.find()
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username profilePicture')
            .populate('likes', 'username profilePicture')
            .populate({
                path: 'retweetedFrom.tweetId',
                populate: {
                    path: 'userId',
                    select: 'username profilePicture'
                }
            })
            .populate({
                path: 'retweets.userId',
                select: 'username profilePicture'
            })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({
            success: true,
            count: tweets.length,
            tweets: tweets
        });

    } catch (error) {
        console.error("Erreur récupération tweets:", error);
        res.status(400).json({ 
            success: false,
            message: "Erreur lors de la récupération des tweets",
            error: error.message 
        });
    }
};

// Obtenir un tweet spécifique
exports.getTweetById = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
            .populate('userId', 'username avatar')
            .populate('mentions', 'username')
            .exec();
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet non trouvé' });
        }
        res.json(tweet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like/Unlike un tweet
exports.toggleLike = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet non trouvé' });
        }

        const userIndex = tweet.likes.indexOf(req.user.userId);
        if (userIndex === -1) {
            tweet.likes.push(req.user.userId);
        } else {
            tweet.likes.splice(userIndex, 1);
        }

        await tweet.save();
        res.json(tweet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Retweet/Unretweet
exports.toggleRetweet = async (req, res) => {
    try {
        const originalTweetId = req.params.id;
        const userId = req.user.userId;
        const { content } = req.body;

        // Vérifier si le tweet original existe
        const originalTweet = await Tweet.findById(originalTweetId);
        if (!originalTweet) {
            return res.status(404).json({ message: "Tweet original non trouvé" });
        }

        // Créer le nouveau tweet (retweet)
        const retweet = new Tweet({
            userId: userId,
            content: content || "",
            media: originalTweet.media,
            hashtags: originalTweet.hashtags,
            mentions: originalTweet.mentions,
            retweetedFrom: {
                userId: originalTweet.userId,
                tweetId: originalTweetId
            }
        });

        await retweet.save();

        // Ajouter le retweet à la liste des retweets du tweet original
        await Tweet.findByIdAndUpdate(originalTweetId, {
            $push: {
                retweets: {
                    userId: userId,
                    tweetId: retweet._id
                }
            }
        });

        // Récupérer le retweet avec toutes les informations
        const populatedRetweet = await Tweet.findById(retweet._id)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username profilePicture')
            .populate('retweetedFrom.userId', 'username profilePicture')
            .populate('retweetedFrom.tweetId')
            .exec();

        res.status(201).json({
            message: "Retweet créé avec succès",
            tweet: populatedRetweet
        });

    } catch (error) {
        console.error("Erreur retweet:", error);
        res.status(400).json({ 
            message: "Erreur lors du retweet",
            error: error.message 
        });
    }
};

// Supprimer un tweet
exports.deleteTweet = async (req, res) => {
    try {
        const tweetId = req.params.id;
        const userId = req.user.userId;

        // Trouver le tweet à supprimer
        const tweet = await Tweet.findById(tweetId);
        
        if (!tweet) {
            return res.status(404).json({ message: "Tweet non trouvé" });
        }

        // Vérifier si l'utilisateur est le propriétaire du tweet
        if (tweet.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce tweet" });
        }

        // Si c'est un tweet original, supprimer tous les retweets associés
        if (tweet.retweets && tweet.retweets.length > 0) {
            // Récupérer tous les IDs des retweets
            const retweetIds = tweet.retweets.map(retweet => retweet.tweetId);
            
            // Supprimer tous les retweets
            await Tweet.deleteMany({ _id: { $in: retweetIds } });
        }

        // Si c'est un retweet, supprimer la référence dans le tweet original
        if (tweet.retweetedFrom && tweet.retweetedFrom.tweetId) {
            await Tweet.findByIdAndUpdate(
                tweet.retweetedFrom.tweetId,
                {
                    $pull: {
                        retweets: {
                            tweetId: tweetId
                        }
                    }
                }
            );
        }

        // Supprimer le tweet
        await Tweet.findByIdAndDelete(tweetId);

        res.status(200).json({ 
            message: "Tweet et tous les retweets associés ont été supprimés avec succès",
            deletedTweetId: tweetId
        });

    } catch (error) {
        console.error("Erreur suppression tweet:", error);
        res.status(400).json({ 
            message: "Erreur lors de la suppression du tweet",
            error: error.message 
        });
    }
};

// Rechercher des tweets par hashtag
exports.searchByHashtag = async (req, res) => {
    try {
        const { hashtag } = req.params;
        const tweets = await Tweet.find({ hashtags: hashtag })
            .sort({ createdAt: -1 })
            .populate('userId', 'username avatar')
            .populate('mentions', 'username')
            .exec();
        res.json(tweets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRetweet = async (req, res) => {
    try {
        const { tweetId, content } = req.body;
        const userId = req.user.userId;

        // Vérifier si le tweet original existe
        const originalTweet = await Tweet.findById(tweetId);
        if (!originalTweet) {
            return res.status(404).json({ message: "Tweet original non trouvé" });
        }

        // Vérifier si l'utilisateur a déjà retweeté
        const existingRetweet = await Tweet.findOne({
            'userId': userId,
            'retweetData.originalTweet': tweetId,
            'retweetData.isRetweet': true
        });

        if (existingRetweet) {
            return res.status(400).json({ message: "Vous avez déjà retweeté ce tweet" });
        }

        // Créer le retweet
        const retweet = new Tweet({
            userId: userId,
            content: content || originalTweet.content, // Utilise le contenu original si pas de nouveau contenu
            retweetData: {
                isRetweet: true,
                originalTweet: tweetId
            }
        });

        await retweet.save();

        // Mettre à jour le tweet original
        await Tweet.findByIdAndUpdate(tweetId, {
            $addToSet: { 'retweetData.retweetedBy': userId }
        });

        // Récupérer le retweet avec toutes les informations
        const populatedRetweet = await Tweet.findById(retweet._id)
            .populate('userId', 'username profilePicture')
            .populate({
                path: 'retweetData.originalTweet',
                populate: {
                    path: 'userId',
                    select: 'username profilePicture'
                }
            })
            .exec();

        res.status(201).json({
            message: "Retweet créé avec succès",
            tweet: populatedRetweet
        });

    } catch (error) {
        console.error("Erreur création retweet:", error);
        res.status(400).json({ 
            message: "Erreur lors de la création du retweet",
            error: error.message 
        });
    }
};