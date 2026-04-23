const Course = require("../../models/Course");
const mongoose = require("mongoose");
const CourseBatch = require("../../models/CourseBatch");

exports.fetchAllCourses = async (req, res) => {
    try {
       
        const { subject_id, category_id, page = 1, limit = 10 } = req.query;
        if (subject_id && !mongoose.Types.ObjectId.isValid(subject_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid subject_id"
            });
        }
        if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid category_id"
            });
        }
        let query = { status: true };
        if (subject_id) {
            query.subject_id = subject_id;
        }
        if (category_id) {
            query.sub_category_id = category_id;
        }
        const skip = (page - 1) * limit;
         const courses = await Course.find(query)
                .select("name type total_hrs total_min language total_no_of_lesson thumbnail subject_id sub_category_id")
                .populate({
                    path: "subject_id",
                    select: "name"   // only fetch name from subject
                })
                .populate({
                    path: "sub_category_id",
                    select: "name"   // only fetch name from sub category
                })
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 })
                .lean();
        const total = await Course.countDocuments(query);
        if (!courses.length) {
            return res.status(200).json({
                status: true,
                message: "No courses found",
                data: [],
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        }
        res.status(200).json({
            status: true,
            count: courses.length,
            data: courses,
            // pagination: {
            //     total,
            //     page: Number(page),
            //     limit: Number(limit)
            // }
        });
    } catch (error) {
        console.error("Course Index Error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.courseDetail = async (req, res) => {
    try{
        const { course_id } = req.query;
        const course = await Course.findById(course_id).populate("videos");
        res.status(200).json({
            status: true,
            data: course
        });
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}

exports.cancelClass = async (req, res) => {
    try {
        const { batch_id, class_id } = req.body;

        // ✅ Validation
        if (!batch_id || !class_id) {
            return res.status(400).json({
                status: false,
                message: "batch_id and class_id are required"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(batch_id) ||
            !mongoose.Types.ObjectId.isValid(class_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid IDs"
            });
        }

        // ✅ Update specific class inside array
        const updatedBatch = await CourseBatch.findOneAndUpdate(
            {
                _id: batch_id,
                "classes._id": class_id
            },
            {
                $set: {
                    "classes.$.class_status": "cancelled"
                }
            },
            { new: true }
        );

        if (!updatedBatch) {
            return res.status(404).json({
                status: false,
                message: "Batch or class not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Class cancelled successfully",
            data: updatedBatch
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