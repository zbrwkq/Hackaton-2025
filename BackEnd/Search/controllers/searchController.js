const mongoose = require('mongoose');
const Tweet = require('../../Tweets/models/tweetModel');
const User = require('../../users/models/User');

exports.search = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        const userId = req.user.userId; // Récupéré du middleware auth
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié"
            });
        }

        const { q = '' } = req.query;

        // Recherche de tweets
        const tweets = await Tweet.find({
            content: { $regex: q, $options: 'i' }
        })
        .populate('userId', 'username profilePicture')
        .populate('mentions', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .sort({ createdAt: -1 })
        .exec();

        // Recherche d'utilisateurs
        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { bio: { $regex: q, $options: 'i' } }
            ]
        })
        .select('-password')
        .exec();

        // Recherche de hashtags
        const hashtags = await Tweet.aggregate([
            { 
                $match: { 
                    hashtags: { $regex: q, $options: 'i' }
                }
            },
            { $unwind: '$hashtags' },
            { 
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            results: {
                tweets,
                users,
                hashtags,
                query: q
            }
        });

    } catch (error) {
        console.error("Erreur détaillée:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la recherche",
            error: error.message
        });
    }
};

// Recherche de tendances
exports.getTrends = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié"
            });
        }

        const { period = '24h' } = req.query;
        
        // Calculer la date limite selon la période
        const dateLimit = new Date();
        switch (period) {
            case '24h':
                dateLimit.setHours(dateLimit.getHours() - 24);
                break;
            case '7d':
                dateLimit.setDate(dateLimit.getDate() - 7);
                break;
            case '30d':
                dateLimit.setDate(dateLimit.getDate() - 30);
                break;
            default:
                dateLimit.setHours(dateLimit.getHours() - 24);
        }

        // Aggrégation des tendances
        const trends = await Tweet.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: dateLimit },
                    hashtags: { $exists: true, $ne: [] }
                }
            },
            { $unwind: '$hashtags' },
            { 
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 },
                    likes: { $sum: { $size: '$likes' } },
                    retweets: { $sum: { $size: '$retweets' } }
                }
            },
            { 
                $project: {
                    hashtag: '$_id',
                    count: 1,
                    engagement: { $add: ['$likes', '$retweets'] }
                }
            },
            { $sort: { count: -1, engagement: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            period,
            trends
        });

    } catch (error) {
        console.error("Erreur tendances:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des tendances",
            error: error.message
        });
    }
};
