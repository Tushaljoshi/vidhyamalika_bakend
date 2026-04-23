const mongoose = require("mongoose");
const RecordedCourseTestSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: false
    },
    duration: { 
        type: Number,
        required: true
    },
}, { timestamps: true });
RecordedCourseTestSchema.virtual("questions", {
    ref: "RecordedCourseTestQue",
    localField: "_id",
    foreignField: "course_test_id"
});
RecordedCourseTestSchema.set("toObject", { virtuals: true });
RecordedCourseTestSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("RecordedCourseTest", RecordedCourseTestSchema, "recorded_course_test");