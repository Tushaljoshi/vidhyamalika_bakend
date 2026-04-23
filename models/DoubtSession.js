const mongoose = require("mongoose");

const DoubtSessionSchema = new mongoose.Schema({
    message: String,
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseBatch"
    },

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sent_by: String,
}, {timestamps: true});

module.exports = mongoose.model("DoubtSession", DoubtSessionSchema, "doubt_sessions");