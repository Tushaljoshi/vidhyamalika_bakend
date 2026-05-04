// models/TeacherSlot.js

const mongoose = require("mongoose");

const teacherSlotSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    day: {
      type: String,
      enum: [
        "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
      ],
      required: true,
    },
    start_time: String,
    end_time: String,

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    className: String,

    is_booked: {
      type: Boolean,
      default: false,
    },

    //settings snapshot
    settings_snapshot: {
      session_duration: Number,
      break_between_sessions: Number,
      earliest_start_time: String,
      latest_end_time: String,
      max_sessions_per_day: Number,
      className: [String],
    },
  },
  { timestamps: true }
);

// prevent duplicate slots
teacherSlotSchema.index(
  { teacher_id: 1, course_id: 1, day: 1, start_time: 1, end_time: 1 },
  { unique: true }
);

module.exports = mongoose.model("TeacherSlot", teacherSlotSchema);