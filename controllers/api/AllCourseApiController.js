const Course = require("../../models/Course");
const mongoose = require("mongoose");

exports.fetchAllCourses = async (req, res) => {
    try {
       
        const { subject_id, category_id, page = 1, limit = 10 } = req.body;
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
            .select("name type total_hrs total_min language total_no_of_lession thumbnail")
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
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error("Course Index Error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};


