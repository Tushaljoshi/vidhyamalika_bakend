const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const authMiddleware = require("../middleware/AuthMiddleware");
const guestMiddleware = require("../middleware/GuestMiddleware");

const AdminController = require('../controllers/backend/AdminController');
const SubjectController = require('../controllers/backend/SubjectController');
const MainCategoryController = require("../controllers/backend/MainCategoryController");
const SubCategoryController = require("../controllers/backend/SubCategoryController");
const RecordedCourseController = require("../controllers/backend/RecordedCourseController");
const LiveCourseController = require('../controllers/backend/LiveCourseController');
const StudentController = require("../controllers/backend/StudentController");
const TeacherControler = require("../controllers/backend/TeacherController");
const BlogController = require("../controllers/backend/BlogController");
const SiteSettingController = require("../controllers/backend/SiteSettingController");
const OrderController = require("../controllers/backend/OrderController");
const ContactEnquiryController = require("../controllers/backend/ContactEnquiryController");
const FeedbackController = require("../controllers/backend/FeedbackController");
const SocialMediaLinkController = require("../controllers/backend/SocialMediaLinkController");
const ScheduledExamController = require("../controllers/backend/ScheduledExamController");
const CourseFeedbackController = require("../controllers/backend/CourseFeedbackController");
const OtherPageController = require("../controllers/backend/OtherPageController");
const ExamResultController = require("../controllers/backend/ExamResultController");

// Auth Routes
 
router.get('/login', guestMiddleware, AdminController.loginPage);
router.post('/login', guestMiddleware, AdminController.loginStore);
router.get('/dashboard', authMiddleware, AdminController.dashboard);
router.get("/logout", AdminController.logout);

// Forgot password flow
router.get("/forgot-password", guestMiddleware, AdminController.forgotPassword);
router.post("/send-otp", guestMiddleware, AdminController.sendOTP);
router.get("/verify-otp", guestMiddleware, AdminController.verifyOtp);
router.post("/verify-otp", guestMiddleware, AdminController.verifyOtpSubmit);
router.get("/reset-password", guestMiddleware, AdminController.resetPassword);
router.post("/reset-password", guestMiddleware, AdminController.changePassword);

// router.get("/verify-otp", (req, res) => {
//     const { email } = req.query;
//     res.render("backend/verify-otp", {
//         email
//     });
// });

// router.post("/verify-otp", guestMiddleware, AdminController.adminVerifyOtp);
// router.post("/resend-otp", guestMiddleware, AdminController.adminResendOtp);


// Subject Routes
router.get('/subject', authMiddleware, SubjectController.index);
router.post('/subject/store', authMiddleware, upload("subjects").single("subject_image"), SubjectController.store);
router.post('/subject/update', authMiddleware, upload("subjects").single("subject_image"), SubjectController.update);
router.get("/subject/destroy/:id", authMiddleware, SubjectController.destroy);

// MainCategory Routes
router.get("/main-categories", authMiddleware, MainCategoryController.index);
router.post("/main-category/store", authMiddleware, upload("main_category").single("category_image"), MainCategoryController.store);
router.post("/main-category/update", authMiddleware, upload("main_category").single("category_image"), MainCategoryController.update);
router.get("/main-category/destroy/:id", authMiddleware, MainCategoryController.destroy);

// Sub Category Routes
router.get("/sub-categories", authMiddleware, SubCategoryController.index);
router.get("/sub-category/get-main-categories/:id", authMiddleware, SubCategoryController.getMainCategoryList);
router.post("/sub-category/store", authMiddleware, upload("sub_category").single("category_image"), SubCategoryController.store);
router.post("/sub-category/update", authMiddleware, upload("sub_category").single("category_image"), SubCategoryController.update);
router.get("/sub-category/destroy/:id", authMiddleware, SubCategoryController.destroy);

// Recorded Course Routes
router.get("/course/recorded-course", authMiddleware, RecordedCourseController.index);
router.get("/course/recorded-course/create", authMiddleware, RecordedCourseController.create);
router.post("/course/recorded-course/store", authMiddleware, upload("recorded_course").fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video_file[]", maxCount: 50 }
]), RecordedCourseController.store);
router.get("/course/recorded-course/edit/:id", authMiddleware, RecordedCourseController.edit);
router.post(
    "/course/recorded-course/update",
    authMiddleware,
    upload("recorded_course").any(),
    RecordedCourseController.update
);
router.get("/course/recorded-course/destroy/:id", authMiddleware, RecordedCourseController.destroy);

router.get("/get-sub-categories/:id", authMiddleware, RecordedCourseController.getSubCategoryList);

router.get('/course/recorded-course/view/:id', authMiddleware, RecordedCourseController.viewReordedCourse);
router.get("/course/recored-course-test/:id", authMiddleware, RecordedCourseController.recordedCourseTest);
router.post("/course/update-test-detail", authMiddleware, RecordedCourseController.updateTestDetail);
router.post("/course/add-recorded-course-test-que", authMiddleware, RecordedCourseController.addRecordedCourseTestQue);
router.post("/course/update-recorded-course-test-que", authMiddleware, RecordedCourseController.updateRecordedCourseTestQue);

router.get("/course/live-course", authMiddleware, LiveCourseController.index);
router.get("/course/live-course/create", authMiddleware, LiveCourseController.create);
router.post("/course/live-course/store", authMiddleware, upload("online_course").single("thumbnail"), LiveCourseController.store);
router.get("/course/live-course/edit/:id", authMiddleware, LiveCourseController.edit);
router.post("/course/live-course/update", authMiddleware, upload("online_course").single("thumbnail"), LiveCourseController.update);
router.get('/course/live-course/view/:id', authMiddleware, LiveCourseController.view);
router.get("/course/live-course/destroy/:id", authMiddleware, LiveCourseController.destroy);

router.get('/students', authMiddleware, StudentController.index);
router.get('/student/view/:id', authMiddleware, StudentController.view);
router.get('/student/destroy/:id', authMiddleware, StudentController.destroy);

router.get('/teachers', authMiddleware, TeacherControler.index);
router.get("/teacher/create", authMiddleware, TeacherControler.create);
router.post("/teacher/store", authMiddleware, upload("teachers").single("teacher_photo"), TeacherControler.store);
router.get("/teacher/view/:id", authMiddleware, TeacherControler.view);
router.get("/teacher/edit/:id", authMiddleware, TeacherControler.edit);
router.post("/teacher/update", authMiddleware, upload("teachers").single("teacher_photo"), TeacherControler.update);
router.get("/teacher/destroy/:id", authMiddleware, TeacherControler.destroy);

router.get("/blogs", authMiddleware, BlogController.index);
router.get("/blog/create", authMiddleware, BlogController.create);
router.post("/blog/store", authMiddleware, upload("blogs").single("thumbnail"), BlogController.store);
router.get("/blog/edit/:id", authMiddleware, BlogController.edit);
router.post("/blog/update", authMiddleware, upload("blogs").single("thumbnail"), BlogController.update);
router.get("/blog/view/:id", authMiddleware, BlogController.view);
router.get("/blog/destroy/:id", authMiddleware, BlogController.destroy);

router.get("/other-page", authMiddleware, OtherPageController.index);
router.get("/other-page/create", authMiddleware, OtherPageController.create);
router.post("/other-page/store", authMiddleware, OtherPageController.store);
router.get("/other-page/edit/:id", authMiddleware, OtherPageController.edit);
router.post("/other-page/update", authMiddleware, OtherPageController.update);
router.get("/other-page/view/:id", authMiddleware, OtherPageController.view);
router.get("/other-page/destroy/:id", authMiddleware, OtherPageController.destroy);

router.get("/feedback", authMiddleware, FeedbackController.index);
router.get("/feedback/destroy/:id", authMiddleware, FeedbackController.destroy);
router.get("/course-feedback", authMiddleware, CourseFeedbackController.index);

router.get("/contact-enquiries", authMiddleware, ContactEnquiryController.index);
router.get("/contact-enquiries/destroy/:id", authMiddleware, ContactEnquiryController.destroy);

router.get("/site-setting", authMiddleware, SiteSettingController.edit);
router.post(
    "/site-setting/update",
    authMiddleware,
    upload("settings").fields([
        { name: "logo", maxCount: 1 },
        { name: "favicon", maxCount: 1 }
    ]),
    SiteSettingController.update
);


router.get("/orders", authMiddleware, OrderController.index);
router.get("/order/view/:id", authMiddleware, OrderController.view);
router.post("/order/update-order-status", authMiddleware, OrderController.updateOrderStatus);
router.get("/invoice/:order_id", authMiddleware, OrderController.downloadInvoice);
router.get("/order/destroy/:id", authMiddleware, OrderController.destroy);

router.get('/order/online-course-order', authMiddleware, OrderController.onlineCourseOrder);
router.get('/order/online-course-order/view/:id', authMiddleware, OrderController.onlineCourseOrderView);
router.post('/order/online-course-order/assign-teacher-in-online-course-order', authMiddleware, OrderController.assignTeacherInOnlineCourseOrder);


router.get("/social-media-links", authMiddleware, SocialMediaLinkController.index);
router.post("/social-media-links/store", authMiddleware, SocialMediaLinkController.store);
router.post("/social-media-links/update", authMiddleware, SocialMediaLinkController.update);

router.get("/scheduled-exams", authMiddleware, ScheduledExamController.index);
router.get("/scheduled-exams/view/:id", authMiddleware, ScheduledExamController.view);
router.get("/exams-result", authMiddleware, ExamResultController.index);
router.get("/exams-result/view/:id", authMiddleware, ExamResultController.view);

router.get("/export-student", authMiddleware, StudentController.exportStudents);
router.get("/export-teachers", authMiddleware, TeacherControler.exportTeachers);
 
// router.post(
// "/course/recorded-course/store",
// uploadCourse.fields([
//  { name: "thumbnail", maxCount: 1 },
//  { name: "video_file[]", maxCount: 50 }
// ]),
// storeCourse
// );

module.exports = router;
