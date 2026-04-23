const VideoProgress = require("../../models/VideoProgress");

const mongoose = require("mongoose");

exports.markAsRead = async (req, res) => {
    try {
        const { course_id, video_id, is_complete } = req.body;
        const user_id = req.user.id;
        // Basic Validation
        if (!course_id || !video_id || typeof is_complete !== "boolean") {
            return res.status(400).json({
                status: false,
                message: "course_id, video_id and is_complete (boolean) are required"
            });
        }
        // ObjectId Validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(video_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or video_id"
            });
        }
        // Check if already exists
        const existing = await VideoProgress.findOne({
            course_id,
            video_id,
            student_id: user_id
        });

        if (existing) {
            return res.status(200).json({
                status: true,
                message: "Already marked",
                data: existing
            });
        }
        // Create new record
        const progress = await VideoProgress.create({
            course_id,
            video_id,
            student_id: user_id,
            is_completed: is_complete,
        });
        return res.status(200).json({
            status: true,
            message: "Marked successfully",
            data: progress
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
};