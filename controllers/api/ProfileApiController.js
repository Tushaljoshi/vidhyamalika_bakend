const mongoose = require("mongoose");
const User = require("../../models/User");

exports.getProfile = async (req, res) => {
    try {
        // ✅ 1. Check auth
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: User not logged in"
            });
        }

        // ✅ 2. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid user ID"
            });
        }

        // ✅ 3. Fetch user
        const user_data = await User.findById(user_id).select("-password");

        // ✅ 4. Check user exists
        if (!user_data) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // ✅ 5. Success response
        return res.status(200).json({
            status: true,
            data: user_data
        });

    } catch (error) {
        console.error("Get Profile Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.user?.id;

        // ✅ 1. Auth check
        if (!user_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // ✅ 2. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid user ID"
            });
        }

        const { name, email, phone } = req.body;

        // ✅ 3. At least one field required
        if (!name && !email && !phone && !req.file) {
            return res.status(400).json({
                status: false,
                message: "At least one field is required to update"
            });
        }

        // ✅ 4. Email validation
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid email format"
                });
            }

            // ✅ Check duplicate email
            const existingEmail = await User.findOne({ email, _id: { $ne: user_id } });
            if (existingEmail) {
                return res.status(400).json({
                    status: false,
                    message: "Email already in use"
                });
            }
        }

        // ✅ 5. Phone validation (India standard)
        if (phone) {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid phone number"
                });
            }

            const existingPhone = await User.findOne({ phone, _id: { $ne: user_id } });
            if (existingPhone) {
                return res.status(400).json({
                    status: false,
                    message: "Phone already in use"
                });
            }
        }

        // ✅ 6. Prepare update object
        let updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;

        // ✅ 7. Handle photo upload
        if (req.file) {
            updateData.photo = req.file.path; // or your full URL logic
        }

        // ✅ 8. Update user
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        // ✅ 9. Check user exists
        if (!updatedUser) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};