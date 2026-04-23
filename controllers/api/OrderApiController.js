const Order = require("../../models/Order");
const OrderCourse = require("../../models/OrderCourse");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Cart = require("../../models/Cart");
const OrderNumberCounter = require("../../models/OrderNumberCounter");
const Course = require("../../models/Course");
const mongoose = require("mongoose");
const VideoProgress = require("../../models/VideoProgress");
const OnlineCourseOrder = require("../../models/OnlineCourseOrder");
const { SendMail } = require("../../config/SendMail");
const { GuestWelcomeEmail } = require("../../emails/GuestWelcomeEmail");
const { OrderConfirmationEmail } = require("../../emails/OrderConfirmationEmail");
const razorpay = require("../../config/razorpay");
const crypto = require("crypto");
// const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const PDFDocument = require("pdfkit");
const jwt = require("jsonwebtoken");


exports.placeOrder = async (req, res) => {
    try {
        const { temp_id, user_id, name, email, phone } = req.body;
        let finalUserId = user_id;
        let user;
        if (user_id) {
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid user_id"
                });
            }
            user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            }
             if (user.user_role === 1) {
                return res.status(409).json({
                    status: false,
                    message: "Student login required to place an order."
                });
            }

            const cartItems = await Cart.find({
                user_id: user_id
            }); 
            if (!cartItems.length) {
                return res.status(400).json({
                    status: false,
                    message: "Cart is empty"
                });
            }
        } else {
            const cartItems = await Cart.find({
                temp_id: temp_id
            }); 
            if (!cartItems.length) {
                return res.status(400).json({
                    status: false,
                    message: "Cart is empty"
                });
            }
            if (!email || !phone || !name) {
                return res.status(400).json({
                    status: false,
                    message: "Name, email, phone required for guest checkout"
                });
            }
            user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                const password = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(password, 10);

                user = await User.create({
                    name,
                    email,
                    phone,
                    password: hashedPassword
                });
                //send password via email/SMS==============================================================
                SendMail({
                    to: user.email,
                    subject: "Your Account Details - Vidya Malika",
                    html: GuestWelcomeEmail(user, password)
                }).catch(err => {
                    console.error("Email Error:", err.message);
                });
                //send password via email/SMS==============================================================
            }else{
                return res.status(409).json({
                    status: false,
                    message: "User already exists please login first."
                });
            }

           
            finalUserId = user._id;
            if (temp_id) {
                await Cart.updateMany(
                    { temp_id },
                    {
                        $set: { user_id: finalUserId },
                        $unset: { temp_id: "" }
                    }
                );
            }

            
        }
        const cartItems = await Cart.find({
            user_id: finalUserId
        }); 
        if (!cartItems.length) {
            return res.status(400).json({
                status: false,
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;
        const orderItems = cartItems.map(item => {
            totalAmount += item.sale_price;
            return {
                course_id: item.course_id,
                price: item.sale_price,
                thumbnail: item.thumbnail,
                name: item.name,
                type: item.course_type,
            };
        });
        const orderNumber = await getNextOrderNumber();
        const order = await Order.create({
            order_number: orderNumber,
            user_id: finalUserId,
            items: orderItems,
            total_amount: totalAmount,
            payment_status: "pending",
            order_status: "pending"
        });

        order.items.map(item => {
            if(item.type === "online"){
                return OnlineCourseOrder.create({
                    student_id: finalUserId,
                    course_id: item.course_id,
                    order_id: order._id,
                    payment_status: "pending",
                    order_status: "pending"
                });
            } 
        }); 
        // Integrate payment gateway here=============================================
          const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // paise
            currency: "INR",
            receipt: order.order_number.toString()
        });
          // ✅ Save razorpay_order_id
        order.razorpay_order_id = razorpayOrder.id;
        await order.save();
        // Integrate payment gateway here=============================================

        // await Cart.deleteMany({ user_id: finalUserId }); //clear cart after payment success.
        //Order Confirmation Email:- =====================================================================
        // const user = await User.findById(finalUserId);
        // SendMail({
        //     to: user.email,
        //     subject: "Order Confirmation - Vidya Malika",
        //     html: OrderConfirmationEmail(user, order)
        //     }).catch(err => {
        //     console.error("Email Error:", err.message);
        // });
        //Order Confirmation Email:- =====================================================================
        const token = jwt.sign(
        {
            id: user._id,
            role: user.user_role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );
        const userData = user.toObject();

         return res.status(200).json({
            status: true,
            message: "Order created",
            data: {
                order_id: order._id,
                razorpay_order_id: razorpayOrder.id,
                amount: totalAmount * 100,
                currency: "INR",
                key: process.env.RAZORPAY_KEY_ID,
                user: user,
                token: token,
                user_data: userData
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
};

const getNextOrderNumber = async () => {
    const counter = await OrderNumberCounter.findOne({ key: "order" });
    if (!counter) {
        await OrderNumberCounter.create({ key: "order", seq: 10000 });
    }
    const updated = await OrderNumberCounter.findOneAndUpdate(
        { key: "order" },
        { $inc: { seq: 1 } },
        { new: true }
    );
    return `ORD-${updated.seq}`;
};

exports.getAllOrders = async (req, res) => {
    try{
        const userId = req.user?.id; 
        const orders = await Order.find({
            user_id: userId
        });
   
        return res.status(200).json({
            status: true,
            data: orders, 
            user_id: userId,
        });
    }catch(error){
        res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
}

exports.getOrderedCourse = async (req, res) => {
     try{
        const userId = req.user.id; 
        const orders = await Order.find({
            user_id: userId
        });
       // 2. Extract course_ids
        const courseIds = [];  
          orders.forEach(order => {
            order.items.forEach(item => {
                courseIds.push(item.course_id);
            });
        });
        // 3. Fetch all courses in one query
        const courses = await Course.find({
            _id: { $in: courseIds }
        }); 
        return res.status(200).json({
            status: true,
            data: courses, 
        })
    }catch(error){
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
}

exports.getCourseOrderedVideos = async (req, res) => {
    try{
        const { course_id } = req.query;
        const user_id = req.user.id;
        const course = await Course.findOne({
            _id: course_id
        }).populate("videos");
        const progress = await VideoProgress.find({
            student_id: user_id
        });
        const progressMap = {};
        progress.forEach(p => {
            progressMap[p.video_id.toString()] = p.is_completed;
        });
        course.videos = course.videos.map(video => ({
            ...video.toObject(),
            is_completed: progressMap[video._id.toString()] || false
        }));
        return res.status(200).json({
            status: true,
            data: course
        });
    }catch(error){
        res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
}

exports.getOnlineCourseOrderForTeacher = async (req, res) => {
    try{
        const teacher_id = req.user?.id;
        const courses = await OnlineCourseOrder.find({
            teacher_id
        }).populate("course_id").populate("student_id").populate("order_id");
        res.status(200).json({
            status: true,
            data: courses
        });
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
            

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                status: false,
                message: "Payment verification failed",
                my_signature: razorpay_signature
            });
        }

        // ✅ Find order
        const order = await Order.findOne({ razorpay_order_id });

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found"
            });
        }

        // ✅ Update order
        order.payment_status = "paid";
        order.order_status = "completed";
        order.razorpay_payment_id = razorpay_payment_id;

        await order.save();

        // ✅ Clear cart
        await Cart.deleteMany({ user_id: order.user_id });

        // ✅ Send email
        const user = await User.findById(order.user_id);


        const token = jwt.sign(
        {
            id: user._id,
            role: user.user_role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );
        const userData = user.toObject();

        // SendMail({
        //     to: user.email,
        //     subject: "Order Confirmation",
        //     html: OrderConfirmationEmail(user, order)
        // });

        return res.status(200).json({
            status: true,
            message: "Payment successful",
            user: user,
            token: token,
            user_data: userData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};

exports.getOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.query;
        const user_id = req.user?.id; // from JWT

        // ✅ Validation
        if (!order_id) {
            return res.status(400).json({
                status: false,
                message: "order_id is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(order_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid order_id"
            });
        }

        // ✅ Fetch order (secure: only own order)
        const order = await Order.findOne({
            _id: order_id,
            // user_id: user_id
        }).lean();

        if (!order) {
            return res.status(404).json({
                status: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            status: true,
            data: order
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}; 

// exports.downloadInvoice = async (req, res) => {
//     try{
//         const { order_id } = req.body;
//          const order = await Order.findById(order_id)
//                     .populate("user_id")
//                     .lean();
        
//                 if (!order) {
//                     return res.status(404).send("Order not found");
//                 }
        
//                 // ✅ Render EJS → HTML
//                 const html = await ejs.renderFile(
//                     path.join(__dirname, "../../views/backend/order/invoice.ejs"),
//                     {
//                         order,
//                         logoUrl: "http://localhost:3000/assets/images/logo.png"
//                     }
//                 );
        
//                 // ✅ Launch browser
//                 const browser = await puppeteer.launch({
//                     args: ["--no-sandbox"]
//                 });
        
//                 const page = await browser.newPage();
        
//                 await page.setContent(html, { waitUntil: "load" });
        
//                 // ✅ Generate PDF
//                 const pdfBuffer = await page.pdf({
//                     format: "A4",
//                     printBackground: true
//                 });
        
//                 await browser.close();
        
//                 // ✅ Send as download
//                 res.setHeader("Content-Type", "application/pdf");
//                 res.setHeader(
//                     "Content-Disposition",
//                     `attachment; filename=invoice-${order.order_number}.pdf`
//                 );
        
//                 res.send(pdfBuffer);
//     }catch(error){
//         res.status(500).json({
//             status: false,
//             message: "Something went wrong",
//             error: error.message
//         });
//     }
// }
// exports.downloadInvoice = async (req, res) => {
//     try{
//         const { order_id } = req.params;
//          const order = await Order.findById(order_id)
//                    .populate("user_id")
//                    .lean();
       
//                if (!order) {
//                    return res.status(404).send("Order not found");
//                }
//        console.log("testing");
//                // ✅ CALL HERE
//                generateInvoice(order, res);
//     }catch(error){
//         res.status(500).json({
//             status: false,
//             message: "Something went wrong",
//             error: error.message
//         });
//     }
// }

// const generateInvoice = (order, res) => {
//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=invoice-${order.order_number}.pdf`
//     );

//     doc.pipe(res);

//     const pageWidth = doc.page.width;

//     // ================= HEADER =================
//     const logoPath = path.join(__dirname, "../../public/assets/images/logo.png");

//     if (fs.existsSync(logoPath)) {
//         doc.image(logoPath, 50, 40, { width: 80 });
//     }

//     doc
//         .fontSize(16)
//         .font("Helvetica-Bold")
//         .text("Vidya Malika", pageWidth - 200, 40, { align: "right" });

//     doc
//         .fontSize(10)
//         .fillColor("gray")
//         .text("www.vidyamalika.com", { align: "right" });

//     // Divider
//     doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).stroke();

//     // ================= TITLE =================
//     doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).stroke();

//     // 🔥 FIX: Reset cursor position
//     doc.y = 140;          // set vertical position
//     doc.x = 50;           // reset horizontal position

//     doc
//         .fontSize(20)
//         .fillColor("black")
//         .font("Helvetica-Bold")
//         .text("INVOICE", 0, doc.y, {
//             align: "center",
//             width: pageWidth
//         });

//     doc.moveDown(1.5);

//     // ================= CUSTOMER + ORDER =================
//     const startY = doc.y;

//     // LEFT SIDE
//     doc
//         .font("Helvetica-Bold")
//         .text("Customer Details", 50, startY);

//     doc
//         .font("Helvetica")
//         .fontSize(11)
//         .text(`Name: ${order.user_id?.name || "N/A"}`, 50)
//         .text(`Email: ${order.user_id?.email || "N/A"}`, 50)
//         .text(`Phone: ${order.user_id?.phone || "N/A"}`, 50);

//     // RIGHT SIDE (FIXED WIDTH)
//     const rightX = pageWidth / 2 + 20;

//     doc
//         .font("Helvetica-Bold")
//         .text("Order Details", rightX, startY);

//     doc
//         .font("Helvetica")
//         .text(`Order No: ${order.order_number}`, rightX)
//         .text(`Date: ${new Date(order.createdAt).toDateString()}`, rightX)
//         .text(`Payment: ${order.payment_status}`, rightX)
//         .text(`Status: ${order.order_status}`, rightX);

//     // ================= TABLE =================
//     doc.moveDown(3);

//     let y = doc.y;

//     const tableWidth = pageWidth - 100;

//     const colSN = 70;
//     const colCourse = 100;
//     const colType = pageWidth - 220;
//     const colPrice = pageWidth - 150;

//     // HEADER BG
//     doc.rect(50, y, tableWidth, 25).fill("#f2f2f2");

//     doc
//         .fillColor("black")
//         .font("Helvetica-Bold")
//         .fontSize(11)
//         .text("S.N.", colSN, y + 7)
//         .text("Course", colCourse, y + 7)
//         .text("Type", colType, y + 7)
//         .text("Price", colPrice, y + 7, { align: "right", width: 50 });

//     y += 25;

//     doc.font("Helvetica");

//     // ================= ROWS =================
//     order.items.forEach((item, index) => {

//         // Row border
//         doc.rect(50, y, tableWidth, 25).stroke("#e0e0e0");

//         doc
//             .text(index + 1, colSN, y + 7)
//             .text(item.name, colCourse, y + 7, { width: 200 })
//             .text(item.type.toUpperCase(), colType, y + 7)
//             .text(`Rs. ${item.price}/-`, colPrice, y + 7, {
//                 align: "right",
//                 width: 50
//             });

//         y += 25;

//         if (y > 750) {
//             doc.addPage();
//             y = 50;
//         }
//     });

//     // ================= TOTAL =================
//     doc.moveDown();

//     doc
//         .font("Helvetica-Bold")
//         .fontSize(13)
//         .text(
//             `Total Amount: Rs. ${Number(order.total_amount).toLocaleString("en-IN")}/-`,
//             50,
//             y + 15,
//             { align: "right", width: tableWidth }
//         );

//     // ================= FOOTER =================
//     doc.moveDown(3);

//     doc
//         .fontSize(10)
//         .fillColor("gray")
//         .text("Thank you for your purchase!", {
//             align: "center"
//         });

//     doc.end();
// };