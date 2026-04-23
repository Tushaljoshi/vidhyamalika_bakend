    const mongoose = require("mongoose");

    const OnlineExamSchema = new mongoose.Schema({
        title: String,
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
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
        duration: Number,
        // exam_date: Date,
        // exam_time: Date,
        questions: [
            {   
                question: String,
                option_a: String,
                option_b: String,
                option_c: String,
                option_d: String,
                marks: Number,
                correct_answer: String,
                question_type: String,
            }
        ],
        is_published: {
            type: Boolean,
            default: false
        },
    }, { timestamps: true } );

    module.exports = mongoose.model("OnlineExam", OnlineExamSchema, "online_exams");