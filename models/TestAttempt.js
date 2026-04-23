const mongoose = require("mongoose");
const TestAttemptSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "RecordedCourseTest"
    },
    questions :[
        {
            question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "RecordedCourseTestQue"
            },
            question: String,
            selected_ans: String,
            is_correct: Boolean,
        }
    ],
    total_marks: Number,
    correct_answers: Number,
    total_questions: Number,
    time_taken: Number, // in seconds
    percentage: Number,
    is_passed: Boolean,
}, { timestamps: true} );

module.exports = mongoose.model("TestAttempt", TestAttemptSchema, "test_attempts");