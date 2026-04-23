const User = require("../../models/User");
const { Parser } = require('json2csv');
const Order = require("../../models/Order");
const AssignmentAttempt = require("../../models/AssignmentAttempt");
const Cart = require("../../models/Cart");
const CommonFeedback = require("../../models/CommonFeedback");
const CourseFeedback = require("../../models/CourseFeedback");
const DoubtSession = require("../../models/DoubtSession");
const HelpAndSupport = require("../../models/HelpAndSupport");
const OnlineCourseOrder = require("../../models/OnlineCourseOrder");
const TestAttempt = require("../../models/TestAttempt");
const VideoProgress = require("../../models/VideoProgress");
const CourseBatch = require("../../models/CourseBatch");
const OnlineExamAttempt = require("../../models/OnlineExamAttempt");


exports.index = async (req, res) => {
    try{
        const students = await User.find({
            user_role: 2
        }).sort({created_at: -1});
        res.render('backend/student/index', {
            students
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/backend/student/index');
    }
}


exports.view = async (req, res) => {
    try {
        const id = req.params.id; 
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).send("Student not found");
        }
        res.render("backend/student/view", {
            student
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


exports.getLatestAttemptsPerBatch = async (req, res) => {
    try {
        const student_id = req.user?.id; // from JWT

        if (!student_id) {
            return res.status(400).json({
                status: false,
                message: "student_id is required"
            });
        }

        const data = await OnlineExamAttempt.aggregate([
            {
                // ✅ Filter by student
                $match: {
                    student_id: new mongoose.Types.ObjectId(student_id)
                }
            },
            {
                // ✅ Sort latest first
                $sort: { createdAt: -1 }
            },
            {
                // ✅ Group by batch → pick latest attempt
                $group: {
                    _id: "$batch_id",
                    latest_attempt: { $first: "$$ROOT" }
                }
            },
            {
                // ✅ Replace root with actual data
                $replaceRoot: { newRoot: "$latest_attempt" }
            },

            // ✅ Optional: join course
            {
                $lookup: {
                    from: "courses",
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

            // ✅ Optional: join batch
            {
                $lookup: {
                    from: "coursebatches",
                    localField: "batch_id",
                    foreignField: "_id",
                    as: "batch"
                }
            },
            { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

            {
                // ✅ Clean response
                $project: {
                    _id: 1,
                    course_id: 1,
                    batch_id: 1,
                    exam_id: 1,
                    total_marks: 1,
                    percentage: 1,
                    is_passed: 1,
                    createdAt: 1,
                    course_name: "$course.name",
                    batch_title: "$batch.title"
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

exports.exportStudents = async (req, res) => {
    try {
        const users = await User.find({
            user_role: 2
        }).lean();

        // 🔹 Transform data
        const formattedUsers = users.map(user => ({
            name: user.name,
            email: user.email,
            phone: user.phone,
            "Joining Date": user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN')
                : ''
        }));

        const fields = ['name', 'email', 'phone', 'Joining Date'];

        const parser = new Parser({ fields });
        const csv = parser.parse(formattedUsers);

        res.header('Content-Type', 'text/csv');
        res.attachment('students.csv');
        res.send(csv);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            req.flash("error", "Invalid Request");
            return res.redirect("/students");
        }

        // Delete related data
        await Promise.all([
            Order.deleteMany({ user_id: id }),
            AssignmentAttempt.deleteMany({ student_id: id }),
            Cart.deleteMany({ user_id: id }),
            CommonFeedback.deleteMany({ student_id: id }),
            CourseFeedback.deleteMany({ student_id: id }),
            DoubtSession.deleteMany({ student_id: id }),
            HelpAndSupport.deleteMany({ student_id: id }),
            OnlineCourseOrder.deleteMany({ student_id: id }),
            OnlineExamAttempt.deleteMany({ student_id: id }),
            TestAttempt.deleteMany({ student_id: id }),
            VideoProgress.deleteMany({ student_id: id }),

            CourseBatch.updateMany(
                { "students.student_id": id },
                { $pull: { students: { student_id: id } } }
            ),
        ]);

        // Delete user
        await User.findByIdAndDelete(id);

        req.flash("success", "Student deleted successfully");
        res.redirect("/students");

    } catch (error) {
        console.log(error.message);
        req.flash("error", "Something went wrong");
        res.redirect("/students");
    }
}; 


exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/teachers");
        }   
        await User.findByIdAndDelete(id);
        req.flash("success", "Teacher has been deleted successfully");
        res.redirect("/teachers");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/teachers");
    }
}