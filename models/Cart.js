const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    temp_id: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    course_type: String,
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    price: Number,
    sale_price: Number,
    thumbnail: String,
    name: String,
}, {timestamps: true});

module.exports = mongoose.model("Cart", CartSchema, 'carts');