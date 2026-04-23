const mongoose = require("mongoose");

const MainCategorySchema = new mongoose.Schema({
    name: String,
    image_path: String,
    image: String,
    slug: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("MainCategory", MainCategorySchema, "main_categories");