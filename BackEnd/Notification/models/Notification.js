const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["like", "retweet", "reply", "follow", "mention"],
    required: true,
  },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tweetId: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet" },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", NotificationSchema);
