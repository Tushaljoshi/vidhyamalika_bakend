const DoubtSession = require("../../models/DoubtSession");
const CourseBatch = require("../../models/CourseBatch");
const mongoose = require("mongoose");

 

exports.create = async (req, res) => {
    try {
        const { message, course_id, batch_id, student_id, sent_by } = req.body;

        // ✅ Required fields validation
        if (!message || !course_id || !batch_id || !student_id) {
            return res.status(400).json({
                success: false,
                message: "message, course_id, batch_id, student_id are required"
            });
        }

        // ✅ Trim message
        if (!message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        // ✅ Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id) ||
            !mongoose.Types.ObjectId.isValid(student_id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid IDs provided"
            });
        }

        // ✅ Check batch exists
        const batch = await CourseBatch.findById(batch_id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found"
            });
        }

        // ✅ Check teacher exists in batch
        if (!batch.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "Teacher not assigned to this batch"
            });
        }

        const teacher_id = batch.teacher_id;

        // ✅ Optional: Validate course matches batch (important)
        if (course_id !== batch.course_id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Course does not belong to this batch"
            });
        }

        // ✅ Prevent spam (optional - same message within few seconds)
        const recentMessage = await DoubtSession.findOne({
            student_id,
            batch_id,
            message: message.trim(),
            createdAt: { $gte: new Date(Date.now() - 5000) } // last 5 sec
        });

        if (recentMessage) {
            return res.status(429).json({
                success: false,
                message: "Duplicate message detected, please wait"
            });
        }

        // ✅ Create doubt session
        const doubtSession = await DoubtSession.create({
            message: message.trim(),
            course_id,
            batch_id,
            student_id,
            teacher_id,
            sent_by,
        });

        return res.status(201).json({
            success: true,
            message: "Doubt session created successfully",
            data: doubtSession
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.getMessageStudent = async (req, res) => {
    try{
        const { course_id, batch_id, student_id } = req.query;

         const messages = await DoubtSession.find({
            course_id,
            batch_id,
            student_id
        }).sort({ createdAt: 1 }); // optional: oldest first

        res.status(200).json({
            status: true,
            data: messages
        });
    }catch(error){
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}
 

exports.getGroupedChatListOnTeacherPanel = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id, batch_id } = req.query;

        if (!teacher_id) {
            return res.status(400).json({
                status: false,
                message: "teacher_id is required"
            });
        }

        // ✅ Match filter
        const matchFilter = {
            teacher_id: new mongoose.Types.ObjectId(teacher_id)
        };

        // ✅ Optional filters
        if (course_id) {
            matchFilter.course_id = new mongoose.Types.ObjectId(course_id);
        }
        if (batch_id) {
            matchFilter.batch_id = new mongoose.Types.ObjectId(batch_id);
        }

        const data = await DoubtSession.aggregate([
            {
                $match: matchFilter
            },
            {
                $group: {
                    _id: {
                        course_id: "$course_id",
                        batch_id: "$batch_id"
                    }
                }
            },

            // ✅ Join Course
            {
                $lookup: {
                    from: "courses",
                    localField: "_id.course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

            // ✅ Join Batch
            {
                $lookup: {
                    from: "course_batch",
                    localField: "_id.batch_id",
                    foreignField: "_id",
                    as: "batch"
                }
            },
            { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    _id: 0,
                    course_id: "$_id.course_id",
                    batch_id: "$_id.batch_id",
                    course_name: "$course.name",
                    batch_title: "$batch.title"
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

 
 

exports.getAllChatListOnTeacherPanel = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id, batch_id, student_id } = req.query;

        if (!teacher_id) {
            return res.status(400).json({
                status: false,
                message: "teacher_id is required"
            });
        }

        // ✅ Dynamic match filter
        const matchFilter = {
            teacher_id: new mongoose.Types.ObjectId(teacher_id)
        };

        if (course_id) {
            matchFilter.course_id = new mongoose.Types.ObjectId(course_id);
        }
        if (batch_id) {
            matchFilter.batch_id = new mongoose.Types.ObjectId(batch_id);
        }
        if (student_id) {
            matchFilter.student_id = new mongoose.Types.ObjectId(student_id);
        }

        const data = await DoubtSession.aggregate([
            {
                $match: matchFilter
            },
            {
                // ✅ latest first
                $sort: { createdAt: -1 }
            },
            {
                // ✅ Group ONLY by student
                $group: {
                    _id: "$student_id",
                    course_id: { $first: "$course_id" },
                    batch_id: { $first: "$batch_id" },
                    latest_message: { $first: "$message" },
                    latest_time: { $first: "$createdAt" }
                }
            },

            // ✅ Join Course
            {
                $lookup: {
                    from: "courses",
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

            // ✅ Join Batch
            {
                $lookup: {
                    from: "course_batch", // ⚠️ fix name if needed
                    localField: "batch_id",
                    foreignField: "_id",
                    as: "batch"
                }
            },
            { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

            // ✅ (Optional) Join Student
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    _id: 0,
                    student_id: "$_id",
                    student_name: "$student.name",
                    course_id: 1,
                    batch_id: 1,
                    course_name: "$course.name",
                    batch_title: "$batch.title",
                    latest_message: 1,
                    latest_time: 1
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};