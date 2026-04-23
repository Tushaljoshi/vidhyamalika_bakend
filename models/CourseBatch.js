const mongoose = require("mongoose");

const CourseBatchSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: String,
    start_time: {
            type: Date,
            required: true
        },
    end_time: {
            type: Date,
            required: true
        },
    start_date: {
        type: Date,
        required: false
    },
    session: String,
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "closed"],
        default: "upcoming"
    },
    classes: [
        {
            title: String,
            meeting_link: {
                type: String,
                required: true
            },
            time: Date,
            date: Date,
            class_status: String, //if cancelled then enter cancelled
        }
    ],
    students: [
        {
            student_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: "User"
            },
            name: String,
            email: String,
            added_on: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("CourseBatch", CourseBatchSchema, "course_batch");