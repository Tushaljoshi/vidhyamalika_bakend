const mongoose = require('mongoose');

const RecordedCourseVideoSchema = new mongoose.Schema({
    lesson_number: String,
    title: String,
    video_type: String,
    video_file: String,
    video_url: String,
    status: {
        type: Boolean,
        default: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecordedCourse",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("RecoredCourseVideo", RecordedCourseVideoSchema, "recorded_course_videos")