const mongoose = require('mongoose');

exports.search = async (req, res) => {
    try {

        const {
            q = '',              // terme de recherche
            type = 'all',        // 'all', 'tweets', 'users', 'hashtags'
            startDate,           // format: YYYY-MM-DD
            endDate,             // format: YYYY-MM-DD
            sortBy = 'recent',   // 'recent', 'popular'

            limit = 10,          // nombre de résultats
            category            // nouvelle option pour filtrer par catégorie
        } = req.query; // une requete http est de la

        const Tweet = mongoose.model('Tweet');
        const User = mongoose.model('User');

        let results = {
            tweets: [],
            users: [],
            hashtags: []
        };

        // Construire le filtre de date
        const dateFilter = {};
        if (startDate) {
            dateFilter.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            dateFilter.createdAt = { 
                ...dateFilter.createdAt, 
                $lte: new Date(endDate + 'T23:59:59.999Z') 
            };
        }

        // 1. Recherche de tweets
        if (type === 'all' || type === 'tweets') {
            const tweetQuery = {
                ...dateFilter,
                $or: [
                    { content: { $regex: q, $options: 'i' } },
                    { hashtags: { $regex: q, $options: 'i' } }
                ]
            };


            // Modification ici pour la catégorie
            if (category !== undefined && category !== '') {
                tweetQuery.category = Number(category); // Conversion explicite en nombre
            }

            const sortOptions = sortBy === 'popular' 
                ? { 'likes.length': -1 } 
                : { createdAt: -1 };

            results.tweets = await Tweet.find(tweetQuery)
                .populate('userId', 'username profilePicture')
                .populate('mentions', 'username profilePicture')
                .populate('likes', 'username profilePicture')
                .sort(sortOptions)
                .limit(Number(limit))
                .lean()
                .exec();
        }

        // 2. Recherche d'utilisateurs
        if (type === 'all' || type === 'users') {
            const userQuery = {
                $or: [
                    { username: { $regex: q, $options: 'i' } },
                    { bio: { $regex: q, $options: 'i' } }
                ]
            };

            results.users = await User.find(userQuery)
                .select('-password')
                .limit(Number(limit))
                .lean()
                .exec();
        }

        // 3. Recherche de hashtags
        if (type === 'all' || type === 'hashtags') {
            const hashtagResults = await Tweet.aggregate([
                { 
                    $match: {
                        ...dateFilter,
                        hashtags: { $exists: true, $ne: [] }
                    }
                },
                { $unwind: '$hashtags' },
                { 
                    $match: q 
                        ? { hashtags: { $regex: q, $options: 'i' } }
                        : {}
                },
                { 
                    $group: {
                        _id: '$hashtags',
                        count: { $sum: 1 },
                        lastUsed: { $max: '$createdAt' },
                        likes: { $sum: { $size: '$likes' } }
                    }
                },
                { 
                    $project: {
                        hashtag: '$_id',
                        count: 1,
                        lastUsed: 1,
                        popularity: { $add: ['$count', '$likes'] }
                    }
                },
                { 
                    $sort: sortBy === 'popular' 
                        ? { popularity: -1 } 
                        : { lastUsed: -1 } 
                },
                { $limit: Number(limit) }
            ]);

            results.hashtags = hashtagResults;
        }

        res.status(200).json({
            success: true,
            query: {
                term: q,
                type,
                dateRange: { startDate, endDate },
                sortBy,

                limit,
                category: category !== undefined ? Number(category) : null // Conversion en nombre dans la réponse
            },
            results
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

        const { period = '24h', category } = req.query;
        
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

        // Construire le filtre de base
        const matchFilter = { 
            createdAt: { $gte: dateLimit },
            hashtags: { $exists: true, $ne: [] }
        };

        // Ajouter le filtre de catégorie si spécifié
        if (category) {
            matchFilter.category = category;
        }

        // Aggrégation des tendances
        const trends = await Tweet.aggregate([
            { $match: matchFilter },
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
            category,
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
