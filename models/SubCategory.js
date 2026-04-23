const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
    name: String,
    image_path: String,
    image: String,
    slug: {
        type: String,
        unique: true,
        required: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: false
    },
    main_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainCategory",
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SubCategory", SubCategorySchema, "sub_categories");