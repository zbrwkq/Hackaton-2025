const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", UserSchema);
