const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { SendMail } = require("../../config/SendMail");
const { ForgetPasswordOtpEmail } = require("../../emails/ForgetPasswordOtpEmail");
const User = require("../../models/User");
const validator = require("validator");

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // ✅ Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        await user.save(); 
        SendMail({
            to: user.email,
            subject: "OTP for Password Reset - Vidya Malika",
            html: ForgetPasswordOtpEmail(user, otp)
        }).catch(err => {
            console.error("Email Error:", err.message);
        });

        return res.status(200).json({
            status: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user || !user.otp) {
            return res.status(404).json({
                status: false,
                message: "OTP not found"
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                status: false,
                message: "Invalid OTP"
            });
        }

        // ✅ Delete OTP after verification
        user.otp = null;
        await user.save();

        return res.status(200).json({
            status: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        await user.save(); 
          // ✅ Send Email
        await SendMail({
            to: user.email,
            subject: "Resend OTP - Vidya Malika",
            html: ForgetPasswordOtpEmail(user, otp)
        }).catch(err => {
            console.error("Email Error:", err.message);
        });

        
        return res.status(200).json({
            status: true,
            message: "OTP resent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { email, new_password } = req.body;

        if (!email || !new_password) {
            return res.status(400).json({
                status: false,
                message: "Email and new password are required"
            });
        }

        const normalizedEmail = validator.normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            status: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({   
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};