const mongoose = require("mongoose");

const SocialMediaLinkSchema = new mongoose.Schema({
    title: String,
    icon: String,
    url: String,
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true } );

module.exports = mongoose.model("SocialMediaLink", SocialMediaLinkSchema, "social_media_links");