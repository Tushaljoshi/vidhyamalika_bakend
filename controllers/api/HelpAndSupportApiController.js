const mongoose = require("mongoose");
const validator = require("validator");
const HelpAndSupport = require("../../models/HelpAndSupport");
const User = require("../../models/User");

exports.submit = async (req, res) => {
    try {
        const student_id = req.user?.id;
        const { name, email, phone, issue } = req.body;

        // 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(student_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid user ID"
            });
        }

        // 3. Check user exists
        const user = await User.findById(student_id);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // 4. Required fields validation
        if (!name || !email || !phone || !issue) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, phone, issue) are required"
            });
        }

        // 5. Name validation
        if (!validator.isLength(name.trim(), { min: 2, max: 50 })) {
            return res.status(400).json({
                status: false,
                message: "Name must be between 2 and 50 characters"
            });
        }

        if (!validator.isAlpha(name.replace(/\s/g, ""))) {
            return res.status(400).json({
                status: false,
                message: "Name must contain only letters"
            });
        }

        // 6. Email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: false,
                message: "Invalid email format"
            });
        }

        const normalizedEmail = validator.normalizeEmail(email);

        // 7. Phone validation (India)
        if (!validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({
                status: false,
                message: "Invalid phone number"
            });
        }

        // 8. Issue validation
        if (!validator.isLength(issue.trim(), { min: 10, max: 1000 })) {
            return res.status(400).json({
                status: false,
                message: "Issue must be between 10 and 1000 characters"
            });
        }

        // Optional: sanitize input
        const cleanIssue = validator.escape(issue.trim());

        // 9. Create record
        await HelpAndSupport.create({
            student_id,
            name: name.trim(),
            email: normalizedEmail,
            phone,
            issue: cleanIssue
        });

        return res.status(201).json({
            status: true,
            message: "Request submitted successfully"
        });

    } catch (error) {
        console.error("Help & Support Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
};