const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
    order_number : String,
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    amount : Number,
    total_amount: Number,
    currency: {
        type: String,
        default: 'inr'
    },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    payment_status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    order_status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    items: [
        {
            course_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            thumbnail: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
        }
    ],
}, {timestamps: true});

module.exports = mongoose.model("Order", OrderSchema, "orders");

