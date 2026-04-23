const mongoose = require("mongoose");

const CommonFeedbackSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    feedback: String,
}, { timestamps:true } );

module.exports = mongoose.model("CommonFeedback", CommonFeedbackSchema, "common_feedbacks");