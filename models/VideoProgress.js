const mongoose = require('mongoose');

const VideoProgressSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Course"
    },
    video_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "RecordedCourseVideo"
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    is_completed: {
        type: Boolean,
        default: false
    },
    completed_at: Date
}, {timestamps: true});

module.exports = mongoose.model("VideoProgress", VideoProgressSchema, "video_progress");