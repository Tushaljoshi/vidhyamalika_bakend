const mongoose = require("mongoose");

const OnlineCourseOrderSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Order"
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    },
    payment_status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    order_status: {
        type: String,
        enum: ["pending", "placed", "cancelled"],
        default: "pending"
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
}, {timestamps: true});

module.exports = mongoose.model("OnlineCourseOrder", OnlineCourseOrderSchema, "online_course_orders");