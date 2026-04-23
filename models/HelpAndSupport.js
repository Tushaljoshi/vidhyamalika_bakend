const mongoose = require("mongoose");

const HelpAndSupportSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    name: String,
    email: String,
    issue: String,
}, { timestamps:true } );

module.exports = mongoose.model("HelpAndSupport", HelpAndSupportSchema, "help_and_support");