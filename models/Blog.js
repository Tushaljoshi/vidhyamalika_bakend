const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: String,
    thumbnail: String,
    description: String,
    meta_title: String,
    meta_keyword: String,
    meta_description: String,
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Blog", BlogSchema, "blogs");