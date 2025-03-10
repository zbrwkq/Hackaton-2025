const Tweet = require('../models/tweetModel');

// Créer un nouveau tweet
exports.createTweet = async (req, res) => {
    try {
        const { content, media, hashtags, mentions } = req.body;
        
        // Extraction des hashtags du contenu
        const hashtagRegex = /#(\w+)/g;
        const extractedHashtags = content.match(hashtagRegex) || [];
        const finalHashtags = [...new Set([...hashtags || [], ...extractedHashtags])];

        const tweet = new Tweet({
            userId: req.user._id, // Supposant que l'utilisateur est authentifié
            content,
            media: media || [],
            hashtags: finalHashtags,
            mentions: mentions || []
        });

        await tweet.save();

        const populatedTweet = await Tweet.findById(tweet._id)
            .populate('userId', 'username avatar')
            .populate('mentions', 'username')
            .exec();

        res.status(201).json(populatedTweet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir tous les tweets
exports.getAllTweets = async (req, res) => {
    try {
        const tweets = await Tweet.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username avatar')
            .populate('mentions', 'username')
            .exec();
        res.json(tweets);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const userIndex = tweet.likes.indexOf(req.user._id);
        if (userIndex === -1) {
            tweet.likes.push(req.user._id);
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
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet non trouvé' });
        }

        const userIndex = tweet.retweets.indexOf(req.user._id);
        if (userIndex === -1) {
            tweet.retweets.push(req.user._id);
        } else {
            tweet.retweets.splice(userIndex, 1);
        }

        await tweet.save();
        res.json(tweet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un tweet
exports.deleteTweet = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet non trouvé' });
        }

        // Vérifier que l'utilisateur est le propriétaire du tweet
        if (tweet.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        await tweet.remove();
        res.json({ message: 'Tweet supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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