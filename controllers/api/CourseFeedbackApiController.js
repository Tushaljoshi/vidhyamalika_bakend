const mongoose = require("mongoose");
const validator = require("validator");

const CourseFeedback = require("../../models/CourseFeedback");
const CourseBatch = require("../../models/CourseBatch");

exports.submitCourseFeedback = async (req, res) => {
    try {
        const student_id = req.user?.id;
        const { course_id, batch_id, teacher_id, feedback } = req.body;

        // ✅ 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // ✅ 2. Required fields
        if (!course_id || !batch_id || !teacher_id || !feedback) {
            return res.status(400).json({
                status: false,
                message: "course_id, batch_id, teacher_id and feedback are required"
            });
        }

        // ✅ 3. Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id) ||
            !mongoose.Types.ObjectId.isValid(teacher_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid IDs provided"
            });
        }

        // ✅ 4. Validate feedback text
        if (!validator.isLength(feedback.trim(), { min: 5, max: 1000 })) {
            return res.status(400).json({
                status: false,
                message: "Feedback must be between 5 and 1000 characters"
            });
        }

        const cleanFeedback = validator.escape(feedback.trim());

        // ✅ 5. Check batch exists
        const batch = await CourseBatch.findById(batch_id);
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found"
            });
        }

        // ✅ 6. Validate student is in batch
        const isStudentInBatch = batch.students.some(
            s => s.student_id.toString() === student_id
        );

        if (!isStudentInBatch) {
            return res.status(403).json({
                status: false,
                message: "You are not part of this batch"
            });
        }

        // ✅ 7. Validate batch belongs to course
        if (batch.course_id.toString() !== course_id) {
            return res.status(400).json({
                status: false,
                message: "Batch does not belong to this course"
            });
        }

        // ✅ 8. Validate teacher matches batch
        if (batch.teacher_id.toString() !== teacher_id) {
            return res.status(400).json({
                status: false,
                message: "Teacher does not belong to this batch"
            });
        }

        // ✅ 9. Prevent duplicate feedback
        const alreadyExists = await CourseFeedback.findOne({
            student_id,
            batch_id
        });

        if (alreadyExists) {
            return res.status(400).json({
                status: false,
                message: "You have already submitted feedback for this batch"
            });
        }

        // ✅ 10. Create feedback
        const newFeedback = await CourseFeedback.create({
            teacher_id,
            course_id,
            batch_id,
            student_id,
            feedback: cleanFeedback
        });

        return res.status(201).json({
            status: true,
            message: "Feedback submitted successfully",
            data: newFeedback
        });

    } catch (error) {
        console.error("Create Feedback Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


exports.getCourseFeedbackByBatch = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // 1. Auth check
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }

        // 2. Required fields
        // if (!course_id || !batch_id) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "course_id and batch_id are required"
        //     });
        // }

        // 3. ObjectId validation
        // if (
        //     !mongoose.Types.ObjectId.isValid(course_id) ||
        //     !mongoose.Types.ObjectId.isValid(batch_id)
        // ) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Invalid course_id or batch_id"
        //     });
        // }

        // 4. Verify batch belongs to teacher
        const batch = await CourseBatch.findOne({
            // _id: batch_id,
            // course_id,
            teacher_id
        });
        if (!batch) {
            return res.status(403).json({
                status: false,
                message: "You are not authorized for this batch"
            });
        }
        // 5. Get feedbacks
        const feedbacks = await CourseFeedback.find({
            teacher_id
        })
        .populate("student_id", "name email")
        .sort({ createdAt: -1 });
        return res.status(200).json({
            status: true,
            total: feedbacks.length,
            data: feedbacks
        });

    } catch (error) {
        console.error("getCourseFeedbackByBatch error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};