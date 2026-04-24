const express = require('express');
const router = express.Router();
const ApiAuthMiddleware = require("../middleware/ApiAuthMiddleware");
const StudentApiController = require("../controllers/api/StudentApiController");
const ContactEnquiryApiController = require("../controllers/api/ContactEnquiryApiController");
const CartApiController = require("../controllers/api/CartApiController");
const CoursesApiController = require("../controllers/api/CoursesApiController");
const AllCoursesApiController = require("../controllers/api/AllCourseApiController");
const OrderApiController = require("../controllers/api/OrderApiController");
const CommonFeedbackApiController = require("../controllers/api/CommonFeedbackApiController");
const RecordedVideoApiController = require("../controllers/api/RecordedVideoApiControlloer");
const RecordedCourseTest = require('../models/RecordedCourseTest');
const RecordedCourseTestApiController = require("../controllers/api/RecordedCourseTestApiController");
const HomeApiController = require("../controllers/api/HomeApiController");
const TeacherApiController = require("../controllers/api/TeacherApiController");
const SocialMediaApiController = require("../controllers/api/SocialMediaLinksApiController");
const SiteSettingApiController = require("../controllers/api/SiteSettingApiController");
const ProfileApiController = require("../controllers/api/ProfileApiController");
const HelpAndSupportApiController = require("../controllers/api/HelpAndSupportApiController");
const AnnouncementApiController = require("../controllers/api/AnnouncementApiController");
const CourseFeedbackApiController = require("../controllers/api/CourseFeedbackApiController");
const OtherPageApiController = require("../controllers/api/OtherPageApiController");
const DoubtSessionApiController = require("../controllers/api/DoubtSessionApiController");
const ForgetPasswordApiController = require("../controllers/api/ForgetPasswordApiController");

 

router.post("/student/register", StudentApiController.register);
router.post("/student/login", StudentApiController.login);

router.post("/teacher/register", TeacherApiController.register);
router.post("/teacher/login", TeacherApiController.login);
router.post("/contact-enquiry/submit", ContactEnquiryApiController.submit);
router.post("/add-to-cart", CartApiController.addToCart)
router.get("/cart-list", CartApiController.getCartList)
// Remove Single Item
router.delete("/remove-from-cart", CartApiController.removeFromCart);
// Clear Entire Cart
router.delete("/clear-cart", CartApiController.clearCart);

router.post("/place-order", OrderApiController.placeOrder);
router.post("/order/verify-payment", OrderApiController.verifyPayment);
router.post("/common-feedback-submit", CommonFeedbackApiController.store);
router.get("/menu", HomeApiController.menu);
router.get("/sub-category", HomeApiController.getSubCategories);
router.get("/all-courses", CoursesApiController.fetchAllCourses);
router.get("/course-detail", CoursesApiController.courseDetail);

router.get("/social-media-links", SocialMediaApiController.index);
router.get("/site-setting", SiteSettingApiController.index);
router.get("/other-pages", OtherPageApiController.getAllOtherPages);
router.get("/other-page-detail", OtherPageApiController.getOtherPageBySlug);

// Authencated APIs Route
router.get("/orders", ApiAuthMiddleware, OrderApiController.getAllOrders);
router.get("/order-detail", ApiAuthMiddleware, OrderApiController.getOrderDetail);
router.get("/all-ordered-courses", ApiAuthMiddleware, OrderApiController.getOrderedCourse);
router.get("/all-ordered-courses-videos", ApiAuthMiddleware, OrderApiController.getCourseOrderedVideos);


router.post("/mark-as-read", ApiAuthMiddleware, RecordedVideoApiController.markAsRead);

router.get("/start-test", ApiAuthMiddleware, RecordedCourseTestApiController.startTest);
router.post("/submit-test", ApiAuthMiddleware, RecordedCourseTestApiController.submitTest);
router.get("/recorded-course-test-attempt", ApiAuthMiddleware, RecordedCourseTestApiController.recordedCourseTestAttempt);



router.get("/get-profile", ApiAuthMiddleware, ProfileApiController.getProfile);
router.post("/update-profile", ApiAuthMiddleware, ProfileApiController.updateProfile);

router.post("/teacher/add-availability", ApiAuthMiddleware, TeacherApiController.addTeacherAvailability);
router.get("/teacher/availability/:teacherId", ApiAuthMiddleware, TeacherApiController.getTeacherAvailability);
router.get("/teacher/orders", ApiAuthMiddleware, TeacherApiController.orders);
router.get("/teacher/get-online-course-orders", ApiAuthMiddleware, OrderApiController.getOnlineCourseOrderForTeacher);
router.get("/teacher/live-sessions", ApiAuthMiddleware, TeacherApiController.liveSessions);
router.post("/teacher/create-batch", ApiAuthMiddleware, TeacherApiController.creatBatch);
router.post("/teacher/add-student-in-batch", ApiAuthMiddleware, TeacherApiController.addStudentInBatch);
router.post("/teacher/add-class-in-batch", ApiAuthMiddleware, TeacherApiController.addClassInBatch);
router.post("/teacher/cancel-class", ApiAuthMiddleware, TeacherApiController.cancelBatchClass);
router.get("/teacher/get-all-batch", ApiAuthMiddleware, TeacherApiController.getAllBatch);
router.post("/teacher/create-assignment", ApiAuthMiddleware, TeacherApiController.createAssignment);
router.post("/teacher/update-assignment", ApiAuthMiddleware, TeacherApiController.updateAssignment);
router.get("/teacher/get-assignment", ApiAuthMiddleware, TeacherApiController.getAssignment);
router.post("/teacher/delete-assignment-question", ApiAuthMiddleware, TeacherApiController.deleteAssignmentQuestion);
router.post("/teacher/delete-assignment", ApiAuthMiddleware, TeacherApiController.deleteAssignment);
router.post("/teacher/publish-assignment", ApiAuthMiddleware, TeacherApiController.publishAssignment);

router.post("/teacher/create-online-exam", ApiAuthMiddleware, TeacherApiController.createOnlineExam);
router.post("/teacher/update-online-exam", ApiAuthMiddleware, TeacherApiController.updateOnlineExam);
router.post("/teacher/delete-online-exam-question", ApiAuthMiddleware, TeacherApiController.deleteExamQuestion);
router.post("/teacher/delete-online-exam", ApiAuthMiddleware, TeacherApiController.deleteOnlineExam);
router.post("/teacher/publish-online-exam", ApiAuthMiddleware, TeacherApiController.publishOnlineExam);
router.post("/teacher/cancel-online-class", ApiAuthMiddleware, CoursesApiController.cancelClass);






// router.get("/student/start-exam", ApiAuthMiddleware, StudentApiController.startExam);
router.get("/student/dashboard", ApiAuthMiddleware, StudentApiController.studentDashboard);
router.get("/student/start-assignment", ApiAuthMiddleware, StudentApiController.startAssignment);

router.post("/student/submit-assignment", ApiAuthMiddleware, StudentApiController.submitAssignment);

router.get("/student/start-online-exam", ApiAuthMiddleware, StudentApiController.startExam);
router.post("/student/submit-exam", ApiAuthMiddleware, StudentApiController.submitExam);

router.get("/student/get-latest-attempts", ApiAuthMiddleware, StudentApiController.getLatestAttemptsPerBatch);

router.get("/teacher/dashboard", ApiAuthMiddleware, TeacherApiController.teacherDashboard);
router.get("/teacher/get-online-exam", ApiAuthMiddleware, TeacherApiController.getOnlineExam);
router.get("/student/get-latest-batch-by-student", ApiAuthMiddleware, StudentApiController.getLatestBatchByStudent);
router.post("/student/submit-help-and-support", ApiAuthMiddleware, HelpAndSupportApiController.submit);
router.get("/student/get-announcement-list", ApiAuthMiddleware, AnnouncementApiController.getStudentAnnouncements);
router.get("/student/get-announcement-list", ApiAuthMiddleware, AnnouncementApiController.getStudentAnnouncements);
router.post("/student/submit-course-feedback", ApiAuthMiddleware, CourseFeedbackApiController.submitCourseFeedback);

router.get("/student/get-recorded-course-certificate", ApiAuthMiddleware, StudentApiController.getRecordedCourseCertificate);
router.get("/student/get-online-course-certificate", ApiAuthMiddleware, StudentApiController.getOnlineCourseCertificate);

router.get("/student/payment-history", ApiAuthMiddleware, StudentApiController.getPaymentHistory);
// router.get("/student/download-invoice/:order_id", OrderApiController.downloadInvoice);


router.post("/doubt-session/create", ApiAuthMiddleware, DoubtSessionApiController.create);
router.get("/doubt-session/message-list", ApiAuthMiddleware, DoubtSessionApiController.getMessageStudent);
router.get("/doubt-session/teacher/grouped-chat-list", ApiAuthMiddleware, DoubtSessionApiController.getGroupedChatListOnTeacherPanel);
router.get("/doubt-session/teacher/all-chat-list", ApiAuthMiddleware, DoubtSessionApiController.getAllChatListOnTeacherPanel);

router.get("/teacher/get-course-feedback", ApiAuthMiddleware, CourseFeedbackApiController.getCourseFeedbackByBatch);

router.post("/teacher/create-announcement", ApiAuthMiddleware, AnnouncementApiController.createAnnouncement);





router.post("/forgot-password", ForgetPasswordApiController.forgetPassword);
router.post("/verify-otp", ForgetPasswordApiController.verifyOtp);
router.post("/resend-otp", ForgetPasswordApiController.resendOtp);
router.post("/change-password", ForgetPasswordApiController.changePassword);

module.exports = router;