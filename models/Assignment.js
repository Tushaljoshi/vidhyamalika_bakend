const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
    titel: String,
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        requred: true,
        ref: "Course"
    },
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        requred: true,
        ref: "CourseBatch"
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        requred: true,
        ref: "User"
    },
    due_date: {
        type: Date,
        required: false
    },
    questions: [
        {
            question: String,
            option_a: String,
            option_b: String,
            option_c: String,
            option_d: String,
            correct_answer: String,
            marks: Number,

        }
    ],
    is_published: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema, "assignments");