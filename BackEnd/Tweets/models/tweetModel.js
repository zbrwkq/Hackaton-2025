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
                // Accepte à la fois les URLs http/https et les données base64
                return /^(http|https):\/\/[^ "]+$/.test(url) || 
                       /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(url);
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
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxLength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    category: {
        type: Number,
        default: null
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