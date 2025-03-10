const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 280 // Limite standard de Twitter
    },
    media: [{
        type: String, // URLs des médias
        validate: {
            validator: function(url) {
                // Validation basique d'URL
                return /^(http|https):\/\/[^ "]+$/.test(url);
            },
            message: 'URL invalide'
        }
    }],
    hashtags: [{
        type: String,
        trim: true
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour améliorer les performances de recherche
tweetSchema.index({ hashtags: 1 });
tweetSchema.index({ userId: 1, createdAt: -1 });

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;