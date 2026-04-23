
const ContactEnquiry = require("../../models/ContactEnquiry");
exports.submit = async (req, res) => {
    try{
        const { name, email, phone, service, message } = req.body;
         await ContactEnquiry.create({
            name,
            email,
            phone,
            service,
            message
        });
          return res.status(201).json({
            status: true,
            message: "Enquiry Submited successfully",  
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
}