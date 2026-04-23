const Subject = require("../../models/Subject");
const SubCategory = require("../../models/SubCategory");
const Course = require("../../models/Course");
const mongoose = require("mongoose");

exports.menu = async (req, res) => {
    try{
        const menu_list = await Subject.find().select("name slug image").populate({
            path: "sub_menu",
            select: "name slug, image"
        });

        return res.status(200).json({
            status: true,
            data: menu_list
        });
    }catch(error){
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}

exports.getSubCategories = async (req, res) => {
    try {
        const { subject } = req.body; 
        if (!subject || subject.trim() === "") {
            return res.status(400).json({
                status: false,
                message: "Subject slug is required"
            });
        } 
        const sub = await Subject.findOne({ slug: subject.trim() })
            .select("_id name slug"); 
        if (!sub) {
            return res.status(404).json({
                status: false,
                message: "Subject not found"
            });
        } 
        const sub_categories = await SubCategory.find({
            subject_id: sub._id,
            status: true
        })
        .select("name slug image")
        .sort({ name: 1 });
        if (!sub_categories || sub_categories.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No subcategories found",
                data: []
            });
        }
        return res.status(200).json({
            status: true,
            total: sub_categories.length,
            data: sub_categories
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong", 
        });
    }
};


exports.getCourses = async (req, res) => {
    try{
        const { sub_category } = req.body;
        const sub_cat = SubCategory.findOne({
            slug: sub_category
        });
        const courses = await Course.find({
            sub_category_id: sub_cat._id
        });
        return res.status(200).json({
            status: true,
            total: courses.length,
            data: courses
        });
    }catch(error){
        return res.status(500).json({
            status: false,
            message: "Something went wrong", 
        });
    }
}
 

// exports.getAllListofCors = async (req, res) => {
//     try{
//         const {subject_id, category_id } = req.query;
//              if (subject_id && !mongoose.Types.ObjectId.isValid(subject_id)) {
//                         return res.status(400).json({
//                             status: false,
//                             message: "Invalid subject_id"
//                         });
//                     }
//                     if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
//                         return res.status(400).json({
//                             status: false,
//                             message: "Invalid category_id"
//                         });
//                     }
//                     let query = { status: true };
//                     if (subject_id) {
//                         query.subject_id = subject_id;
//                     }
//                     if (category_id) {
//                         query.sub_category_id = category_id;
//                     }
//                     const skip = (page - 1) * limit;
//                     const courses = await Course.find(query)
//                         .select("name type total_hrs total_min language total_no_of_lession thumbnail")
//                         .skip(skip)
//                         .limit(Number(limit))
//                         .sort({ createdAt: -1 })
//                         .lean();
//                     const total = await Course.countDocuments(query);
//                     if (!courses.length) {
//                         return res.status(200).json({
//                             status: true,
//                             message: "No courses found",
//                             data: [],
//                             pagination: {
//                                 total,
//                                 page: Number(page),
//                                 limit: Number(limit)
//                             }
//                         });
//                     }
//                     res.status(200).json({
//                         status: true,
//                         count: courses.length,
//                         data: courses,
//                         pagination: {
//                             total,
//                             page: Number(page),
//                             limit: Number(limit)
//                         }
//                     });
//     }catch(error){
//         console.error(error);
//         res.status(500).json({
//             status: false,
//             message: "Something went wrong",
//             error: error.message
//         });
//     }
// }