
const Cart = require("../../models/Cart");
const Course = require("../../models/Course");
const mongoose = require("mongoose");
const User = require("../../models/User");

exports.addToCart = async (req, res) => {
    try {
        const { temp_id, course_id, user_id } = req.body;
        if (!course_id) {
            return res.status(400).json({
                status: false,
                message: "course_id is required"
            });
        }
        const course = await Course.findById(course_id).lean();
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }
        let filter = {};
        let cartData = {
            course_id,
            course_type: course.type,
            sale_price: course.sale_price,
            price: course.price,
            thumbnail: course.thumbnail,
            name: course.name,
        };
        if (user_id) {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid user_id"
                });
            }
            const user = await User.findById(user_id).lean();
            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            }
            filter = { user_id, course_id };
            cartData.user_id = user_id;

        } else {
            if (!temp_id) {
                return res.status(400).json({
                    status: false,
                    message: "temp_id is required for guest user"
                });
            }
            filter = { temp_id, course_id };
            cartData.temp_id = temp_id;
        }
        const existing = await Cart.findOne(filter);
        if (existing) {
            return res.status(400).json({
                status: false,
                message: "Course already in cart"
            });
        }
        await Cart.create(cartData);
        return res.status(201).json({
            status: true,
            message: "Added Successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
};

exports.getCartList = async (req, res) => {
    try {
        const { temp_id, user_id } = req.query;

        let filter = {};

        // Case 1: Logged-in user
        if (user_id) {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid user_id"
                });
            }

            const user = await User.findById(user_id).lean();
            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            }

            filter.user_id = user_id;
        }

        // Case 2: Guest user
        else {
            if (!temp_id) {
                return res.status(400).json({
                    status: false,
                    message: "temp_id is required for guest user"
                });
            }

            filter.temp_id = temp_id;
        }

        const cart_list = await Cart.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            status: true,
            count: cart_list.length,
            data: cart_list
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { cart_id } = req.query;
  
        const { temp_id, user_id } = req.query;

        // ✅ Validate cart_id
        if (!cart_id || !mongoose.Types.ObjectId.isValid(cart_id)) {
            return res.status(400).json({
                status: false,
                message: "Valid cart_id is required"
            });
        }

        // ✅ Build condition (user OR guest)
        let condition = { _id: cart_id };

        if (user_id) {
            condition.user_id = user_id;
        } else if (temp_id) {
            condition.temp_id = temp_id;
        } else {
            return res.status(400).json({
                status: false,
                message: "User not authenticated or temp_id missing test",
                data: user_id
            });
        }

        // ✅ Delete item
        const deletedItem = await Cart.findOneAndDelete(condition);

        if (!deletedItem) {
            return res.status(404).json({
                status: false,
                message: "Cart item not found",
                
            });
        }

        return res.status(200).json({
            status: true,
            message: "Item deleted from cart"
        });

    } catch (error) {
        console.error("Remove Cart Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


exports.clearCart = async (req, res) => {
    try {
        const { temp_id, user_id } = req.query;

        // ✅ Validate source
        let condition = {};

        if (user_id) {
            condition.user_id = user_id;
        } else if (temp_id) {
            condition.temp_id = temp_id;
        } else {
            return res.status(400).json({
                status: false,
                message: "User not authenticated or temp_id missing"
            });
        }

        // ✅ Delete all cart items
        const result = await Cart.deleteMany(condition);

        return res.status(200).json({
            status: true,
            message: "Cart cleared successfully",
            deleted_count: result.deletedCount
        });

    } catch (error) {
        console.error("Clear Cart Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};