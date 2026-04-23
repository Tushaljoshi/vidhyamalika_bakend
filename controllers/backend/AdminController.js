const Admin = require('../../models/Admin');
const bccrypt = require("bcryptjs");
const User = require("../../models/User");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const OnlineExamAttempt = require("../../models/OnlineExamAttempt");
const OnlineCourseOrder  = require("../../models/OnlineCourseOrder");
const { ForgetPasswordOtpEmail } = require("../../emails/ForgetPasswordOtpEmail");
const { SendMail } = require("../../config/SendMail");
const validator = require("validator");
const bcrypt = require("bcryptjs");


exports.loginPage = (req, res) => {
    res.render('backend/login', {
          layout: false
    });
}

exports.loginStore = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({email});
    if(!admin){
        req.flash("error", "User not found");
        return res.redirect("/login");
    }
    const isMatch = await bccrypt.compare(password, admin.password);
    if(!isMatch){
        req.flash("error", "Invalid Password");
        return res.redirect("/login");
    }

    req.session.adminId = admin._id;
    req.flash("success", "Login Successfull");
    res.redirect('/dashboard');
};

exports.dashboard = async (req, res) => {
    try {
        // Total Students
        const totalStudents = await User.countDocuments({ user_role: 2 });

        // Total Teachers
        const totalTeachers = await User.countDocuments({ user_role: 1 });

        const totalRecordedCourse = await Course.countDocuments({ type: "recorded"});
        const totalOnlineCourse = await Course.countDocuments({ type: "online"});
        const totalOrders = await Order.countDocuments();
 
 
        // res.send(topTeachers);
    res.render('backend/dashboard', 
        { 
            totalStudents,
            totalTeachers,
            totalRecordedCourse,
            totalOnlineCourse,
            totalOrders    
        });
    }catch(error){
            console.error(error);
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login"); 
    });
 }

 // ================= FORGET PASSWORD =================
 exports.forgotPassword = (req, res) => {
    res.render('backend/forgot-password', {
          layout: false
    });
}

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = validator.normalizeEmail(email);
        const admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin) {
            req.flash("error", "Admin not found");
           return res.redirect("/forgot-password"); 
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        await admin.save();
        await SendMail({
            to: admin.email,
            subject: "Admin OTP - Password Reset",
            html: ForgetPasswordOtpEmail(admin, otp)
        });
         //REDIRECT instead of render
        return res.redirect(`/verify-otp?email=${email}`);
    } catch (error) {
        req.flash("error", "Something went wrong");
       return res.redirect("/forgot-password");
    }
};



 exports.verifyOtp = async (req, res) => {
    const { email } = req.query;
    res.render('backend/verify-otp', {
          layout: false,
          email
    });
}
 exports.verifyOtpSubmit = async (req, res) => {
    const { email, otp } = req.body;

        const normalizedEmail = validator.normalizeEmail(email);

        const admin = await Admin.findOne({ email: normalizedEmail });

     if (!admin) {
        req.flash("error", "Admin not found");
        return res.redirect("/verify-otp"); 
        }

          if (admin.otp !== otp) {
            req.flash("error", "Invalid OTP");
            return res.redirect("/verify-otp"); 
            // return res.status(400).json({
            //     status: false,
            //     message: "Invalid OTP"
            // });
        }    
        return res.redirect(`/reset-password?email=${email}`);
}
 exports.resetPassword = async (req, res) => {
    const { email } = req.query;
    res.render('backend/reset-password', {
          layout: false,
          email
    });
}


 

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
    try {
        const { email, new_password } = req.body;

        const normalizedEmail = validator.normalizeEmail(email);

        const admin = await Admin.findOne({ email: normalizedEmail });

        if (!admin) {
            req.flash("error", "Admin not found");
              return res.redirect(`/reset-password?email=${email}`);

            // return res.status(404).json({
            //     status: false,
            //     message: "Admin not found"
            // });
        } 

        const hashedPassword = await bcrypt.hash(new_password.trim(), 10); 
        admin.password = hashedPassword;
        admin.otp = null; 
        await admin.save();
            req.flash("success", "Password reset successfully.");
            return res.redirect(`/login`); 
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message,
            totlaerror: error
        });
    }
};


