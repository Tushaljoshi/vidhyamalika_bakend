const ContactEnquiry = require("../../models/ContactEnquiry");

exports.index = async (req, res) => {
    try{
        const enquiries = await ContactEnquiry.find().sort({created_at: -1});
        res.render('backend/contact_enquiry/index', {
            enquiries
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/contact-enquiries');
    }
}


exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/contact-enquiries");
        }   
        await ContactEnquiry.findByIdAndDelete(id);
        req.flash("success", "Enquiry has been deleted successfully");
        res.redirect("/contact-enquiries");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/contact-enquiries");
    }
}