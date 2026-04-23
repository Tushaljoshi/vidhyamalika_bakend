const OnlineExam = require("../../models/OnlineExam");
const OnlineExamAttempt = require("../../models/OnlineExamAttempt");
const mongoose = require("mongoose");

exports.index = async (req, res) => {
    try{
        const exams = await OnlineExam.find().populate("batch_id").populate("course_id").populate("teacher_id");
        res.render("backend/scheduled_exams/exam_results/index", {
            exams
        });
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            status: true,
            message: "Something went wrong"
        });
    }
}
exports.view = async (req, res) => {
    try {
        const exam_id = req.params.id;
     const attempts = await OnlineExamAttempt.aggregate([
    {
        $match: {
            exam_id: new mongoose.Types.ObjectId(exam_id)
        }
    },
    {
        $sort: { createdAt: -1 }
    },
    {
        $group: {
            _id: "$student_id",
            latestAttempt: { $first: "$$ROOT" }
        }
    },
    {
        $replaceRoot: { newRoot: "$latestAttempt" }
    },

    // ✅ Student
    {
        $lookup: {
            from: "users",
            localField: "student_id",
            foreignField: "_id",
            as: "student"
        }
    },
    {
        $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true
        }
    },

    // ✅ Exam
    {
        $lookup: {
            from: "online_exams", // verify name
            localField: "exam_id",
            foreignField: "_id",
            as: "exam"
        }
    },
    {
        $unwind: {
            path: "$exam",
            preserveNullAndEmptyArrays: true
        }
    },

    // ✅ Course
    {
        $lookup: {
            from: "courses", // verify name
            localField: "course_id",
            foreignField: "_id",
            as: "course"
        }
    },
    {
        $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true
        }
    },

    // ✅ Batch (NEW)
    {
        $lookup: {
            from: "course_batch", // ⚠️ verify this collection name
            localField: "batch_id",
            foreignField: "_id",
            as: "batch"
        }
    },
    {
        $unwind: {
            path: "$batch",
            preserveNullAndEmptyArrays: true
        }
    },

    // ✅ Clean response
    {
        $project: {
            "questions.correct_answer": 0,

            // optional cleanup
            "student.password": 0,
            "student.__v": 0,
            "exam.__v": 0,
            "course.__v": 0,
            "batch.__v": 0
        }
    }
]);
        // res.send(attempts);
         res.render("backend/scheduled_exams/exam_results/view",
            {
                attempts
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};