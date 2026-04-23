const mongoose = require("mongoose");

const ContactEnquirySchema = new mongoose.Schema({
    name: String,
    email: String,
    service: String,
    phone: String,
    message: String,
}, { timestamps: true} );

module.exports = mongoose.model("ContactEnquiry", ContactEnquirySchema, "contact_enquiries");
