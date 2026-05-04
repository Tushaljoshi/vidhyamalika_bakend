const mongoose = require("mongoose");

const teacherSettingSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    session_duration: {
      type: Number,
      required: true,
    },

    break_between_sessions: {
      type: Number,
      default: 0,
    },

    earliest_start_time: {
      type: String,
      required: true,
    },

    latest_end_time: {
      type: String,
      required: true,
    },

    max_sessions_per_day: {
      type: Number,
      required: true,
    },

    className: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeacherSetting", teacherSettingSchema);