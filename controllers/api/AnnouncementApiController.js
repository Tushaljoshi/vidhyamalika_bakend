const mongoose = require("mongoose");
const validator = require("validator");

const Announcement = require("../../models/Announcement");
const Course = require("../../models/Course");
const CourseBatch = require("../../models/CourseBatch");

exports.createAnnouncement = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id, batch_id, announcement } = req.body;

        // 1. Auth check
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Required fields
        if (!course_id || !batch_id || !announcement) {
            return res.status(400).json({
                status: false,
                message: "course_id, batch_id and announcement are required"
            });
        }

        // 3. Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }

        // 4. Validate announcement text
        if (!validator.isLength(announcement.trim(), { min: 5, max: 1000 })) {
            return res.status(400).json({
                status: false,
                message: "Announcement must be between 5 and 1000 characters"
            });
        }

        const cleanAnnouncement = validator.escape(announcement.trim());

        // 5. Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }

        // 6. Check batch exists
        const batch = await CourseBatch.findById(batch_id);
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found"
            });
        }

        // 7. Validate batch belongs to course
        if (batch.course_id.toString() !== course_id) {
            return res.status(400).json({
                status: false,
                message: "Batch does not belong to this course"
            });
        }

        // 8. Validate teacher ownership (CRITICAL)
        if (batch.teacher_id.toString() !== teacher_id) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to create announcement for this batch"
            });
        }

        // 9. Create announcement
        const newAnnouncement = await Announcement.create({
            teacher_id,
            course_id,
            batch_id,
            announcement: cleanAnnouncement
        });

        return res.status(201).json({
            status: true,
            message: "Announcement created successfully",
            data: newAnnouncement
        });

    } catch (error) {
        console.error("Create Announcement Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

 
exports.getStudentAnnouncements = async (req, res) => {
    try {
        const student_id = req.user?.id;

        // 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(student_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid student ID"
            });
        }

        // 3. Get batch IDs where student is enrolled
        const batchIds = await CourseBatch.distinct("_id", {
            "students.student_id": student_id
        });

        if (!batchIds.length) {
            return res.status(200).json({
                status: true,
                message: "No announcements found",
                data: []
            });
        }

        //  4. Fetch all announcements (no pagination)
        const announcements = await Announcement.find({
            batch_id: { $in: batchIds }
        })
        .populate("teacher_id", "name")
        .populate("course_id", "course_name")
        .populate("batch_id", "batch_name")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            status: true,
            message: "Batch announcements fetched successfully",
            total: announcements.length,
            data: announcements
        });

    } catch (error) {
        console.error("Get Announcements Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};