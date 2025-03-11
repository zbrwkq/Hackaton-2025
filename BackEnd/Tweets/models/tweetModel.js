const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        maxLength: 280
    },
    media: [{
        type: String,
        validate: {
            validator: function(url) {
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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        tweetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    }, { _id: false }],
    retweetedFrom: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        tweetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances de recherche
tweetSchema.index({ hashtags: 1 });
tweetSchema.index({ userId: 1, createdAt: -1 });
tweetSchema.index({ 'retweetData.originalTweet': 1 });

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;