const CommonFeedback = require("../../models/CommonFeedback");


exports.index = async (req, res) => {
    try{     
        const feedbacks = await CommonFeedback.find().populate("student_id").sort({createdAt: -1});
        res.render('backend/feedback/index', {
            feedbacks
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/feedback');
    }
}

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/blogs");
        }   
         await CommonFeedback.findByIdAndDelete(id);
        req.flash("success", "Feedback has been deleted successfully");
        res.redirect("/feedback");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/feedback");
    }
}

