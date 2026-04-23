const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
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
    announcement: String 
}, { timestamps: true} );

module.exports = mongoose.model("Announcement", AnnouncementSchema, "announcements");
