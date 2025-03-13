const mongoose = require('mongoose');
const Tweet = require('../models/tweetModel');
const User = require('../models/User'); // Import direct du modèle User

// Créer un nouveau tweet
exports.createTweet = async (req, res) => {
    try {
        const { content, media, hashtags, mentions, category } = req.body;
        
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
            mentions: mentions || [],
            category: category || null // Gestion de la catégorie
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
        const { category } = req.query; // Ajout du filtre par catégorie

        // Construire le filtre
        const filter = {};
        if (category) {
            filter.category = category;
        }

        const tweets = await Tweet.find(filter)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username profilePicture')
            .populate('likes', 'username profilePicture')
            .populate('comments.userId', 'username profilePicture')
            .populate('savedBy', 'username profilePicture')
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

        // Ajouter un champ pour indiquer si le tweet est sauvegardé par l'utilisateur actuel
        const tweetsWithSaveStatus = tweets.map(tweet => {
            const tweetObj = tweet.toObject();
            tweetObj.isSavedByUser = tweet.savedBy.some(
                userId => userId.toString() === req.user.userId
            );
            return tweetObj;
        });

        res.status(200).json({
            success: true,
            count: tweets.length,
            tweets: tweetsWithSaveStatus
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

// Ajouter un commentaire à un tweet
exports.addComment = async (req, res) => {
    try {
        const tweetId = req.params.id;
        const userId = req.user.userId;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Le contenu du commentaire est requis" });
        }

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet non trouvé" });
        }

        const newComment = {
            userId: userId,
            content: content,
            createdAt: new Date()
        };

        tweet.comments.push(newComment);
        await tweet.save();

        // Récupérer le tweet mis à jour avec tous les commentaires populés
        const updatedTweet = await Tweet.findById(tweetId)
            .populate('userId', 'username profilePicture')
            .populate('comments.userId', 'username profilePicture')
            .populate('mentions', 'username profilePicture')
            .populate({
                path: 'retweetedFrom.tweetId',
                populate: {
                    path: 'userId',
                    select: 'username profilePicture'
                }
            })
            .exec();

        res.status(201).json({
            message: "Commentaire ajouté avec succès",
            tweet: updatedTweet
        });

    } catch (error) {
        console.error("Erreur ajout commentaire:", error);
        res.status(400).json({ 
            message: "Erreur lors de l'ajout du commentaire",
            error: error.message 
        });
    }
};

// Obtenir tous les tweets que l'utilisateur a commenté
exports.getUserCommentedTweets = async (req, res) => {
    try {
        const userId = req.user.userId;

        const commentedTweets = await Tweet.find({
            'comments.userId': userId
        })
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .populate('mentions', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .populate({
            path: 'retweetedFrom.tweetId',
            populate: {
                path: 'userId',
                select: 'username profilePicture'
            }
        })
        .sort({ createdAt: -1 })
        .exec();

        res.status(200).json({
            success: true,
            count: commentedTweets.length,
            tweets: commentedTweets
        });

    } catch (error) {
        console.error("Erreur récupération tweets commentés:", error);
        res.status(400).json({ 
            success: false,
            message: "Erreur lors de la récupération des tweets commentés",
            error: error.message 
        });
    }
};

// Obtenir tous les tweets que l'utilisateur a liké
exports.getUserLikedTweets = async (req, res) => {
    try {
        const userId = req.user.userId;

        const likedTweets = await Tweet.find({
            likes: userId
        })
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .populate('mentions', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .populate({
            path: 'retweetedFrom.tweetId',
            populate: {
                path: 'userId',
                select: 'username profilePicture'
            }
        })
        .sort({ createdAt: -1 })
        .exec();

        res.status(200).json({
            success: true,
            count: likedTweets.length,
            tweets: likedTweets
        });

    } catch (error) {
        console.error("Erreur récupération tweets likés:", error);
        res.status(400).json({ 
            success: false,
            message: "Erreur lors de la récupération des tweets likés",
            error: error.message 
        });
    }
};

// Obtenir tous les tweets que l'utilisateur a retweeté
exports.getUserRetweetedTweets = async (req, res) => {
    try {
        const userId = req.user.userId;

        const retweetedTweets = await Tweet.find({
            'retweets.userId': userId
        })
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
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
            count: retweetedTweets.length,
            tweets: retweetedTweets
        });

    } catch (error) {
        console.error("Erreur récupération retweets:", error);
        res.status(400).json({ 
            success: false,
            message: "Erreur lors de la récupération des retweets",
            error: error.message 
        });
    }
};

// Toggle save/unsave tweet
exports.toggleSaveTweet = async (req, res) => {
    try {
        const tweetId = req.params.id;
        const userId = req.user.userId;

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet non trouvé" });
        }

        // Vérifier si le tweet est déjà sauvegardé
        const isSaved = tweet.savedBy.includes(userId);

        if (isSaved) {
            // Retirer des sauvegardés
            await Tweet.findByIdAndUpdate(tweetId, {
                $pull: { savedBy: userId }
            });
            res.status(200).json({ 
                message: "Tweet retiré des sauvegardés",
                isSaved: false
            });
        } else {
            // Ajouter aux sauvegardés
            await Tweet.findByIdAndUpdate(tweetId, {
                $addToSet: { savedBy: userId }
            });
            res.status(200).json({ 
                message: "Tweet sauvegardé avec succès",
                isSaved: true
            });
        }

    } catch (error) {
        console.error("Erreur sauvegarde tweet:", error);
        res.status(400).json({ 
            message: "Erreur lors de la sauvegarde du tweet",
            error: error.message 
        });
    }
};

// Obtenir tous les tweets sauvegardés par l'utilisateur
exports.getSavedTweets = async (req, res) => {
    try {
        const userId = req.user.userId;

        const savedTweets = await Tweet.find({
            savedBy: userId
        })
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .populate('mentions', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .populate('savedBy', 'username profilePicture')
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
            count: savedTweets.length,
            tweets: savedTweets
        });

    } catch (error) {
        console.error("Erreur récupération tweets sauvegardés:", error);
        res.status(400).json({ 
            success: false,
            message: "Erreur lors de la récupération des tweets sauvegardés",
            error: error.message 
        });
    }
};