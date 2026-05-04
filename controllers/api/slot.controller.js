const User = require("../../models/User");
const Course = require("../../models/Course");
const TeacherSlot = require("../../models/TeacherSlot");
const TeacherSetting = require("../../models/TeacherSetting");
// GET ALL
exports.getAllSlots = async (req, res) => {
    const data = await TeacherSlot.find()
        .populate("teacher_id", "name email")
        .populate("course_id", "name");

    res.json({ success: true, data });
};

// GET BY COURSE
exports.getSlotsByCourse = async (req, res) => {
    const { course_id } = req.query;

    const data = await TeacherSlot.find({ course_id })
        .populate("teacher_id", "name");

    res.json({ success: true, data });
};

// DELETE
exports.deleteSlot = async (req, res) => {
    await TeacherSlot.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};

exports.createSlot = async (req, res) => {
    try {
        const {
            teacher_id,
            course_id,
            day,
            start_time,
            end_time,
            subject,
            className,
        } = req.body;

        // Basic validation
        if (!teacher_id || !course_id || !day || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        // TIME CONVERSION (for overlap check)
        const toMinutes = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        const newStart = toMinutes(start_time);
        const newEnd = toMinutes(end_time);

        if (newStart >= newEnd) {
            return res.status(400).json({
                success: false,
                message: "Invalid time range",
            });
        }

        // CHECK OVERLAP (CRITICAL)
        const existingSlots = await TeacherSlot.find({
            teacher_id,
            day,
        });

        for (let slot of existingSlots) {
            const existStart = toMinutes(slot.start_time);
            const existEnd = toMinutes(slot.end_time);

            // overlap condition
            if (newStart < existEnd && newEnd > existStart) {
                return res.status(400).json({
                    success: false,
                    message: "Slot is not available",
                });
            }
        }

        // CREATE SLOT
        const slot = await TeacherSlot.create({
            teacher_id,
            course_id,
            day,
            start_time,
            end_time,
            subject,
            className 
        });

        return res.status(201).json({
            success: true,
            message: "Slot created successfully",
            data: slot,
        });

    } catch (error) {
        console.error("Create Slot Error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.saveTeacherSettings = async (req, res) => {
  try {
    const {
      teacherId,
      session_duration,
      break_between_sessions,
      earliest_start_time,
      latest_end_time,
      max_sessions_per_day,
      className = [],
    } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "teacherId is required",
      });
    }

    const setting = await TeacherSetting.findOneAndUpdate(
      { teacher_id: teacherId },
      {
        session_duration,
        break_between_sessions,
        earliest_start_time,
        latest_end_time,
        max_sessions_per_day,
        className,
      },
      {
        new: true,
        upsert: true, // create if not exists
      }
    );

    return res.json({
      status: true,
      message: "Settings saved successfully",
      data: setting,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getTeacherSettings = async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "teacherId is required",
      });
    }

    const setting = await TeacherSetting.findOne({
      teacher_id: teacherId,
    });

    return res.json({
      status: true,
      message: "Settings fetched successfully",
      data: setting || {},
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


// GET SLOTS (teacher / course based)
exports.getSlots = async (req, res) => {
  try {
    const { teacherId, course_id } = req.query;

    let filter = {};

    if (teacherId) filter.teacher_id = teacherId;
    if (course_id) filter.course_id = course_id;

    const data = await TeacherSlot.find(filter)
      .populate("course_id", "name")
      .populate("teacher_id", "name");

    return res.json({
      status: true,
      count: data.length,
      data,
    });

  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateTeacherSettings = exports.saveTeacherSettings;