const mongoose = require("mongoose");

const OtherPageSchema = mongoose.Schema({
    name : String,
    slug: String,
    content: String,
    meta_title: String,
    meta_keyword: String,
    meta_description: String,
    status: {
        type: Boolean,
        default: true
    },
}, {timestamps: true});

module.exports = mongoose.model("OtherPage", OtherPageSchema, "other_pages");

