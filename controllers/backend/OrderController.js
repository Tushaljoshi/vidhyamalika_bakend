const Order = require("../../models/Order");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const OnlineCourseOrder = require("../../models/OnlineCourseOrder");
const User = require("../../models/User");
const { SendMail } = require("../../config/SendMail");
const { AssignTeacherEmail } = require("../../emails/AssignTeacherEmail");
// const puppeteer = require("puppeteer");
const ejs = require("ejs");
 
 

exports.index = async (req, res) => {
    try{
       const orders = await Order.find().populate("user_id").sort({createdAt: -1});
        res.render('backend/order/index', {
            orders
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/backend/order/index');
    }
};


exports.view = async (req, res) => {
    try{
        const id = req.params.id; 
        const order = await Order.findById(id).populate("user_id");
        if(!order){
            return res.status(404).send("Order not found");
        }
        res.render("backend/order/view", {
            order
        });
    }catch(error){
        console.error(error);
        res.status(500).send("Server Error");
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { order_id, payment_status, order_status } = req.body;
    try{
        const order = await Order.findById(order_id);
        if(!order){
            req.flash("error", "Order not found");
            res.redirect("/order/view/"+order_id);
        }
        order.payment_status = payment_status;
        order.order_status = order_status;
        await order.save(); 
        req.flash("success", "Order updated successfully.");
        res.redirect("/order/view/"+order_id);
    }catch(error){
        console.error(error);
        req.flash("error", "Something went wrong");

        res.redirect("/order/view/"+order_id);
    }
}


exports.onlineCourseOrder = async (req, res) => {
    try{
        const orders = await OnlineCourseOrder.find().populate("order_id").populate("student_id").populate("course_id").populate("teacher_id").sort({create_at: -1});
        res.render("backend/order/online_course_order/index", {
            orders
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/order/online-course")
    }
}
exports.onlineCourseOrderView = async (req, res) => {
    try{
        const id = req.params.id;
        const order = await OnlineCourseOrder.findById(id).populate("student_id").populate("order_id").populate("course_id").populate("teacher_id");
        const teachers = await User.find({
            user_role: 1
        });
         
        res.render("backend/order/online_course_order/view", {
            order,
           teachers
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/order/online-course")
    }
}
    exports.assignTeacherInOnlineCourseOrder = async (req, res) => {
        try{ 
            const { teacher_id, online_order_id } = req.body;
    
            const order = await OnlineCourseOrder.findByIdAndUpdate(
                online_order_id,
                {
                    teacher_id: teacher_id
                }
            ).populate("order_id").populate("course_id");
            
        //   res.send(order);
           

        // =========================================================================================
            const teacher_detail = await User.findById(teacher_id);
            const student_detail = await User.findById(order.student_id);
           // format order
            const orderData = {
                date: new Date(order.order_id.createdAt).toLocaleDateString(),
                total_amount: order.order_id.total_amount,
                course: order.course_id
            };
 
            // ✅ Send email to teacher
            // SendMail({
            //     to: teacher_detail.email,
            //     subject: "New Course Assigned - Vidya Malika 📚",
            //     html: AssignTeacherEmail(teacher_detail, student_detail, orderData)
            //     }).catch(err => {
            //     console.error("Email Error:", err.message);
            // });

        // =========================================================================================  

            res.redirect('/order/online-course-order/view/'+online_order_id);  
        }catch(error){
            console.error(error);
            res.send(error);
            // req.flash("error", "Something went wrong");
            // res.redirect("/order/online-course-order/view/"+online_order_id);
        }
    }






// exports.downloadInvoice = async (req, res) => {
//        try {
//         const { order_id } = req.params;

//         const order = await Order.findById(order_id)
//             .populate("user_id")
//             .lean();

//         if (!order) {
//             return res.status(404).send("Order not found");
//         }

//         // ✅ Render EJS → HTML
//         const html = await ejs.renderFile(
//             path.join(__dirname, "../../views/backend/order/invoice.ejs"),
//             {
//                 order,
//                 logoUrl: "http://localhost:3000/assets/images/logo.png"
//             }
//         );

//         // ✅ Launch browser
//         const browser = await puppeteer.launch({
//             args: ["--no-sandbox"]
//         });

//         const page = await browser.newPage();

//         await page.setContent(html, { waitUntil: "load" });

//         // ✅ Generate PDF
//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true
//         });

//         await browser.close();

//         // ✅ Send as download
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader(
//             "Content-Disposition",
//             `attachment; filename=invoice-${order.order_number}.pdf`
//         );

//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error generating invoice");
//     } 
// };


exports.downloadInvoice = async (req, res) => {
    try {
        const { order_id } = req.params;

        const order = await Order.findById(order_id)
            .populate("user_id")
            .lean();

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // ✅ CALL HERE
        generateInvoice(order, res);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
};

 
const generateInvoice = (order, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order.order_number}.pdf`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;

    // ================= HEADER =================
    const logoPath = path.join(__dirname, "../../public/assets/images/logo.png");

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 80 });
    }

    doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Vidya Malika", pageWidth - 200, 40, { align: "right" });

    doc
        .fontSize(10)
        .fillColor("gray")
        .text("www.vidyamalika.com", { align: "right" });

    // Divider
    doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).stroke();

    // ================= TITLE =================
    doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).stroke();

    // 🔥 FIX: Reset cursor position
    doc.y = 140;          // set vertical position
    doc.x = 50;           // reset horizontal position

    doc
        .fontSize(20)
        .fillColor("black")
        .font("Helvetica-Bold")
        .text("INVOICE", 0, doc.y, {
            align: "center",
            width: pageWidth
        });

    doc.moveDown(1.5);

    // ================= CUSTOMER + ORDER =================
    const startY = doc.y;

    // LEFT SIDE
    doc
        .font("Helvetica-Bold")
        .text("Customer Details", 50, startY);

    doc
        .font("Helvetica")
        .fontSize(11)
        .text(`Name: ${order.user_id?.name || "N/A"}`, 50)
        .text(`Email: ${order.user_id?.email || "N/A"}`, 50)
        .text(`Phone: ${order.user_id?.phone || "N/A"}`, 50);

    // RIGHT SIDE (FIXED WIDTH)
    const rightX = pageWidth / 2 + 20;

    doc
        .font("Helvetica-Bold")
        .text("Order Details", rightX, startY);

    doc
        .font("Helvetica")
        .text(`Order No: ${order.order_number}`, rightX)
        .text(`Date: ${new Date(order.createdAt).toDateString()}`, rightX)
        .text(`Payment: ${order.payment_status}`, rightX)
        .text(`Status: ${order.order_status}`, rightX);

    // ================= TABLE =================
    doc.moveDown(3);

    let y = doc.y;

    const tableWidth = pageWidth - 100;

    const colSN = 70;
    const colCourse = 100;
    const colType = pageWidth - 220;
    const colPrice = pageWidth - 150;

    // HEADER BG
    doc.rect(50, y, tableWidth, 25).fill("#f2f2f2");

    doc
        .fillColor("black")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("S.N.", colSN, y + 7)
        .text("Course", colCourse, y + 7)
        .text("Type", colType, y + 7)
        .text("Price", colPrice, y + 7, { align: "right", width: 50 });

    y += 25;

    doc.font("Helvetica");

    // ================= ROWS =================
    order.items.forEach((item, index) => {

        // Row border
        doc.rect(50, y, tableWidth, 25).stroke("#e0e0e0");

        doc
            .text(index + 1, colSN, y + 7)
            .text(item.name, colCourse, y + 7, { width: 200 })
            .text(item.type.toUpperCase(), colType, y + 7)
            .text(`Rs. ${item.price}/-`, colPrice, y + 7, {
                align: "right",
                width: 50
            });

        y += 25;

        if (y > 750) {
            doc.addPage();
            y = 50;
        }
    });

    // ================= TOTAL =================
    doc.moveDown();

    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(
            `Total Amount: Rs. ${Number(order.total_amount).toLocaleString("en-IN")}/-`,
            50,
            y + 15,
            { align: "right", width: tableWidth }
        );

    // ================= FOOTER =================
    doc.moveDown(3);

    doc
        .fontSize(10)
        .fillColor("gray")
        .text("Thank you for your purchase!", {
            align: "center"
        });

    doc.end();
};

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/orders");
        }   
        await OnlineCourseOrder.deleteMany({ order_id: id }), 

        await Order.findByIdAndDelete(id);
        req.flash("success", "Order has been deleted successfully");
        res.redirect("/orders");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/orders");
    }
}