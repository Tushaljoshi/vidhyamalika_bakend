const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    name: String,
    type: String,
    short_description: String,
    full_description: String,
    curriculum: String,
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    total_hrs: Number,
    total_min: Number,
    language: String,
    certificate: String,
    total_no_of_lesson: Number,
    price: Number,
    sale_price: Number,
    thumbnail: String,
     slug: {
        type: String,
        unique: false,
        required: true
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Subject"
    },
    main_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "MainCategory"
    },
    sub_category_id : {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "SubCategory"
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
    }, {timestamps:true});
    // 🔥 Reverse populate
    CourseSchema.virtual("videos", {
        ref: "RecoredCourseVideo",        // model name
        localField: "_id",          // Course ka field
        foreignField: "course_id",  // CourseVideos ka field
    });
    // IMPORTANT
CourseSchema.set("toObject", { virtuals: true });
CourseSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("Course", CourseSchema, "courses");