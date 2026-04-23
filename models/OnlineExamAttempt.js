const mongoose = require("mongoose");

const OnlineExamAttemptSchema = new mongoose.Schema({
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
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "OnlineExam"
    },

    questions: [
        {
            question_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            question: String, 
            answer: String, 
            correct_answer: String, 
            is_correct: Boolean, 
            marks_awarded: {
                type: Number,
                default: 0
            }, 
            question_type: String
        }
    ],

    total_marks: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    total_questions: { type: Number, default: 0 },

    start_time: Date,
    end_time: Date,
    time_taken: Number, // seconds

    percentage: { type: Number, default: 0 },
    is_passed: { type: Boolean, default: false }

}, { timestamps: true });

// ✅ Index for fast queries
OnlineExamAttemptSchema.index({ student_id: 1, exam_id: 1 });

module.exports = mongoose.model(
    "OnlineExamAttempt",
    OnlineExamAttemptSchema,
    "online_exam_attempts"
);