const CourseFeedback = require("../../models/CourseFeedback");

exports.index = async (req, res) => {
    try{
        const feedbacks = await CourseFeedback.find().sort({createdAt: -1}).populate("student_id");
        res.render("backend/feedback/course_feedback/index", {
            feedbacks
        });
    }catch(error){
        console.error(error.message);
        req.flash("error", "Something went wrong");
        res.redirect("/course-feedback");
    }
}