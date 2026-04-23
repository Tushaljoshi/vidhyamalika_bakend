const mongoose = require("mongoose");

const OrderNumberCounterSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 10000 }
});

module.exports = mongoose.model("OrderNumberCounter", OrderNumberCounterSchema, "order_number_counter");