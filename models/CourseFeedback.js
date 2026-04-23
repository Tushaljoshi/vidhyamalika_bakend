const mongoose = require("mongoose");

const CourseFeedbackSchema = new mongoose.Schema({
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    },
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "CourseBatch"
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }, 
    feedback: String,
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true} );

module.exports = mongoose.model("CourseFeedback", CourseFeedbackSchema, "course_feedbacks");
