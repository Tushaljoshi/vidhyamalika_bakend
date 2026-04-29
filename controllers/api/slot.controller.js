const User = require("../../models/User");
const Course = require("../../models/Course");
const TeacherSlot = require("../../models/TeacherSlot");

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
            class: className,
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
    const body = req.body || {};

    const {
      teacherId,
      course_id,
      session_duration,
      break_between_sessions,
      earliest_start_time,
      latest_end_time,
      max_sessions_per_day,
      days = [],
      className
    } = body;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "teacherId is required",
      });
    }

    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    teacher.teaching_settings = {
      session_duration,
      break_between_sessions,
      earliest_start_time,
      latest_end_time,
      max_sessions_per_day,
      days,
      className
    };

    await teacher.save();

    let courses = [];

    if (course_id) {
      const course = await Course.findOne({
        _id: course_id,
        teacher_id: teacherId,
      });

      if (!course) {
        return res.status(404).json({
          status: false,
          message: "Course not found for this teacher",
        });
      }

      courses = [course];

      await TeacherSlot.deleteMany({
        teacher_id: teacherId,
        course_id: course_id,
      });

    } else {
      courses = await Course.find({ teacher_id: teacherId });

      await TeacherSlot.deleteMany({ teacher_id: teacherId });
    }
    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const toTime = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };

    const start = toMinutes(earliest_start_time);
    const end = toMinutes(latest_end_time);

    const selectedDays =
      days.length > 0
        ? days
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let createdSlots = [];
    for (let course of courses) {
      for (let day of selectedDays) {
        let current = start;
        let count = 0;

        while (current + session_duration <= end) {
          if (count >= max_sessions_per_day) break;

          const s = toTime(current);
          const e = toTime(current + session_duration);

          const slot = await TeacherSlot.create({
            teacher_id: teacherId,
            course_id: course._id,
            day,
            start_time: s,
            end_time: e,
            subject: course.subject_id,

            settings_snapshot: {
              session_duration,
              break_between_sessions,
              earliest_start_time,
              latest_end_time,
              max_sessions_per_day,
              days,
            },
          });

          createdSlots.push(slot);

          current += session_duration + break_between_sessions;
          count++;
        }
      }
    }

    return res.json({
      status: true,
      message: "Settings saved & slots generated",
      total_slots_created: createdSlots.length,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// GET TEACHER SETTINGS
exports.getTeacherSettings = async (req, res) => {
  try {
    const { teacherId } = req.query;

    const teacher = await User.findById(teacherId).select("teaching_settings");

    return res.json({
      status: true,
      data: teacher?.teaching_settings || {},
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
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