const mongoose = require("mongoose");

const AssignmentAttemptSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    assignment_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Assignment"
    },
    questions: [
        {
            question_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            question: String,
            selected_ans: String,
            correct_answer: String, // optional (for audit)
            is_correct: Boolean,
            marks_awarded: {
                type: Number,
                default: 0
            }
        }
    ],
    total_marks: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    total_questions: { type: Number, default: 0 },

    start_time: Date,
    end_time: Date,
    time_taken: Number, // seconds

    percentage: { type: Number, default: 0 },
    is_passed: { type: Boolean, default: false },

}, { timestamps: true });

// Index
AssignmentAttemptSchema.index({ student_id: 1, assignment_id: 1 });

module.exports = mongoose.model(
    "AssignmentAttempt",
    AssignmentAttemptSchema,
    "assignment_attempts"
);