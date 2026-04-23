const mongoose = require("mongoose");

const OrderCourseSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    course_type: String,
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    price: Number,
    sale_price: Number,
}, {timestamps: true});

module.exports = mongoose.model("OrderCourse", OrderCourseSchema, "order_courses");