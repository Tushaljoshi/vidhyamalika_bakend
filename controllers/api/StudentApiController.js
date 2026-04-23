const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const OnlineExamAttempt = require("../../models/OnlineExamAttempt");
const CourseBatch = require("../../models/CourseBatch");
const validator = require("validator");
const Cart = require("../../models/Cart");
const { SendMail } = require("../../config/SendMail");
const { WelcomeEmail } = require("../../emails/WelcomeEmail");
const Course = require("../../models/Course");
const Assignment = require("../../models/Assignment");
const AssignmentAttempt = require("../../models/AssignmentAttempt");
const mongoose = require("mongoose");
const OnlineExam = require("../../models/OnlineExam");
const Order = require("../../models/Order");
const TestAttempt = require("../../models/TestAttempt");
const RecordedCourseTest = require("../../models/RecordedCourseTest");

 

exports.studentDashboard = async (req, res) => {
    try {
        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(400).json({
                status: false,
                message: "User not authenticated"
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(user_id);

        // ✅ Orders
        const orders = await Order.find({
            user_id: userObjectId,
            payment_status: "paid"
        }).lean();

        const total_orders = orders.length;
        const total_spent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // ✅ Enrolled Courses (from orders)
        let enrolledCourses = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.course_id) {
                    enrolledCourses.push(item.course_id.toString());
                }
            });
        });

        enrolledCourses = [...new Set(enrolledCourses)];

        // ✅ Completed Courses (based on exam attempts passed)
        const completed = await OnlineExamAttempt.aggregate([
            {
                $match: {
                    student_id: userObjectId,
                    is_passed: true
                }
            },
            {
                $group: {
                    _id: "$course_id"
                }
            }
        ]);

        const completedCourses = completed.map(c => c._id.toString());

        // ✅ Pending Courses
        const pendingCourses = enrolledCourses.filter(
            c => !completedCourses.includes(c)
        );

        // ✅ Recent Orders
        const recent_orders = await Order.find({
            user_id: userObjectId
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("order_number total_amount createdAt")
        .lean();

        return res.status(200).json({
            status: true,
            data: {
                total_orders,
                total_spent,
                total_enrolled_courses: enrolledCourses.length,
                total_completed_courses: completedCourses.length,
                total_pending_courses: pendingCourses.length,
                recent_orders
            }
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


exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, temp_id } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, phone, password) are required"
            });
        }

        // =============================
        // 2. Name Validation
        // =============================
        if (!validator.isLength(name.trim(), { min: 2, max: 50 })) {
            return res.status(400).json({
                status: false,
                message: "Name must be between 2 and 50 characters"
            });
        }
        if (!validator.isAlpha(name.replace(/\s/g, ''))) {
            return res.status(400).json({
                status: false,
                message: "Name must contain only letters"
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: false,
                message: "Invalid email format"
            });
        }
        // const normalizedEmail = validator.normalizeEmail(email);
        const normalizedEmail = validator.normalizeEmail(email, {
            gmail_remove_dots: false
        });

        if (!validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({
                status: false,
                message: "Invalid Indian phone number"
            });
        } 
        if (!validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0
        })) {
            return res.status(400).json({
                status: false,
                message: "Password must be at least 6 characters and include uppercase, lowercase, and number"
            });
        }
        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone }]
        });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "Email or Phone already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone,
            password: hashedPassword
        });
        // ✅ Send Welcome Email (non-blocking recommended)
        // SendMail({
        //     to: user.email,
        //     subject: "Welcome to Vidya Malika 🎉",
        //     html: WelcomeEmail(user)
        // }).catch(err => {
        //     console.error("Email Error:", err.message);
        // });

        // ✅ Merge Guest Cart
        if (temp_id) {
            await Cart.updateMany(
                { temp_id },
                {
                    $set: { user_id: user._id },
                    $unset: { temp_id: "" }
                }
            );
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.user_role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        const userData = user.toObject();
        delete userData.password;
        return res.status(201).json({
            status: true,
            message: "User registered successfully",
            token,
            data: userData,
            user_role: "student",
            user_role_id: user.user_role,
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
};
 
exports.login = async (req, res) => {
    try {
        const { email, password, temp_id } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required"
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: false,
                message: "Invalid email format"
            });
        }
        const normalizedEmail = validator.normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail }).lean();

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password",
                data: normalizedEmail
            });
        }
           if (user.user_role != 2) {
            return res.status(400).json({
                status: false,
                message: "Unauthorized User"
            });
        }

        if (user.status === false) {
            return res.status(403).json({
                status: false,
                message: "Your account is inactive. Contact support."
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }
        // ✅ Merge Guest Cart
        if (temp_id) {
            await Cart.updateMany(
                { temp_id },
                {
                    $set: { user_id: user._id },
                    $unset: { temp_id: "" }
                }
            );
        }
        const token = jwt.sign(
            {
                id: user._id,
                role: user.user_role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        delete user.password;
        return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
            user_role: "student",
            user_role_id: user.user_role,
            data: user
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};

// exports.startExam = async (req, res) => {
    //     try {
    //         const student_id = req.user?.id;
    //         const { course_id, batch_id } = req.body;

    //         if (!student_id) {
    //             return res.status(401).json({
    //                 status: false,
    //                 message: "Unauthorized"
    //             });
    //         }

    //         if (!course_id || !batch_id) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: "course_id and batch_id are required"
    //             });
    //         }

    //         // 1. Validate enrollment
    //         const batch = await CourseBatch.findOne({
    //             _id: batch_id,
    //             course_id,
    //             "students.student_id": student_id
    //         });

    //         if (!batch) {
    //             return res.status(403).json({
    //                 status: false,
    //                 message: "Not enrolled in this batch"
    //             });
    //         }

    //         // 2. Get exam
    //         const exam = await OnlineExam.findOne({ course_id, batch_id });

    //         if (!exam) {
    //             return res.status(404).json({
    //                 status: false,
    //                 message: "Exam not found"
    //             });
    //         }

    //         // 3. Time validation
    //         const now = new Date();

    //         if (exam.exam_date && exam.exam_time) {
    //             const start = new Date(exam.exam_date);
    //             const time = new Date(exam.exam_time);

    //             start.setHours(time.getHours(), time.getMinutes(), 0, 0);

    //             const end = new Date(start.getTime() + exam.duration * 60000);

    //             if (now < start) {
    //                 return res.status(400).json({
    //                     status: false,
    //                     message: "Exam not started yet"
    //                 });
    //             }

    //             if (now > end) {
    //                 return res.status(400).json({
    //                     status: false,
    //                     message: "Exam already ended"
    //                 });
    //             }
    //         }

    //         // 4. Prevent multiple attempts (STRICT MODE)
    //         const existingSubmitted = await OnlineExamAttempt.findOne({
    //             student_id,
    //             exam_id: exam._id,
    //             status: "submitted"
    //         });

    //         if (existingSubmitted) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: "You have already submitted this exam"
    //             });
    //         }

    //         // 5. Resume support
    //         const existingAttempt = await OnlineExamAttempt.findOne({
    //             student_id,
    //             exam_id: exam._id,
    //             status: "in_progress"
    //         });

    //         // 6. Safe questions
    //         const safeQuestions = exam.questions.map(q => ({
    //             _id: q._id,
    //             question: q.question,
    //             option_a: q.option_a,
    //             option_b: q.option_b,
    //             option_c: q.option_c,
    //             option_d: q.option_d,
    //             question_type: q.question_type,
    //             marks: q.marks
    //         }));

    //         if (existingAttempt) {
    //             return res.status(200).json({
    //                 status: true,
    //                 message: "Resume exam",
    //                 data: {
    //                     exam_id: exam._id,
    //                     duration: exam.duration,
    //                     questions: safeQuestions,
    //                     attempt_id: existingAttempt._id
    //                 }
    //             });
    //         }

    //         // 7. Create new attempt
    //         const attempt = await OnlineExamAttempt.create({
    //             course_id,
    //             batch_id,
    //             student_id,
    //             exam_id: exam._id,
    //             questions: [],
    //             total_questions: exam.questions.length,
    //             status: "in_progress",
    //             started_at: new Date()
    //         });

    //         return res.status(200).json({
    //             status: true,
    //             message: "Exam started",
    //             data: {
    //                 exam_id: exam._id,
    //                 duration: exam.duration,
    //                 questions: safeQuestions,
    //                 attempt_id: attempt._id
    //             }
    //         });

    //     } catch (error) {
    //         console.error("startExam error:", error);
    //         return res.status(500).json({
    //             status: false,
    //             message: "Something went wrong"
    //         });
    //     }
// };

// exports.submitOnlineExam = async (req, res) => {
//     try {
//         const student_id = req.user?.id;
//         const { course_id, batch_id, exam_id, questions } = req.body;
//         const passingPercentage = 60;
//         if (!exam_id || !questions || !questions.length) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Exam ID and questions are required"
//             });
//         }
//         // 1. Get exam
//         const exam = await OnlineExam.findById(exam_id);
//         if (!exam) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Exam not found"
//             });
//         }
//         let evaluatedQuestions = [];
//         let correct_answers = 0;
//         let total_marks = 0;
//         let total_possible_marks = 0;
//         // 2. Loop through exam questions
//         for (let examQ of exam.questions) {
//             const studentQ = questions.find(
//                 q => q.question_id == examQ._id.toString()
//             );
//             if (!studentQ) continue;
//             let is_correct = false;
//             // Only evaluate MCQ
//             if (examQ.question_type === "mcq") {
//                 total_possible_marks += examQ.marks;
//                 if (studentQ.answer === examQ.correct_answer) {
//                     is_correct = true;
//                     correct_answers++;
//                     total_marks += examQ.marks;
//                 }
//             }
//             evaluatedQuestions.push({
//                 question_id: examQ._id,
//                 question: examQ.question,
//                 answer: studentQ.answer,
//                 is_correct: examQ.question_type === "mcq" ? is_correct : null,
//                 question_type: examQ.question_type
//             });
//         }
//         const total_questions = evaluatedQuestions.length;
//         // percentage only based on MCQ marks
//         const percentage = total_possible_marks > 0
//             ? (total_marks / total_possible_marks) * 100
//             : 0;
//         const is_passed = percentage >= passingPercentage;
//         // 3. Save attempt
//         const attempt = await OnlineExamAttempt.create({
//             course_id,
//             batch_id,
//             student_id,
//             exam_id,
//             questions: evaluatedQuestions,
//             total_marks,
//             correct_answers,
//             total_questions,
//             percentage,
//             is_passed
//         });
//         return res.status(200).json({
//             status: true,
//             message: "Exam submitted successfully",
//             data: attempt
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             status: false,
//             message: "Something went wrong"
//         });
//     }
// };

exports.getLatestBatchByStudent = async (req, res) => {
    try {
        const { course_id } = req.query;
        const student_id = req.user?.id;

        // ✅ Validation
        if (!course_id || !student_id) {
            return res.status(400).json({
                status: false,
                message: "course_id and student_id are required"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(student_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or student_id"
            });
        }

        // ✅ Query: match inside students array
        const batch = await CourseBatch.findOne({
            course_id,
            "students.student_id": student_id
        })
        .sort({ createdAt: -1 }) // latest batch
        .lean();

        // ✅ Not found
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "No batch found for this student & course"
            });
        }

        res.status(200).json({
            status: true,
            data: batch
        });

    } catch (error) {
        console.error("getLatestBatchByStudent error:", error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.startAssignment = async (req, res) => {
    try {
        const student_id = req.user?.id;
        // Auth validation
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { course_id, batch_id } = req.query;
        // Required fields
        if (!course_id || !batch_id) {
            return res.status(400).json({
                status: false,
                message: "course_id and batch_id are required"
            });
        }
        // ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }
        // Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }
        // Check batch belongs to teacher & course
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id,
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }

      

        // Get assignment
        const assignment = await Assignment.findOne({
            course_id,
            batch_id,
            is_published: true,
        }).select("-questions.correct_answer").lean();
        // Not found case
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }

        const passedAttempt = await AssignmentAttempt.findOne({
            student_id,
            assignment_id: assignment._id,
            is_passed: true
        });
        if (passedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this assignment. Re-attempt not allowed.",
                result: passedAttempt
            });
        }

        return res.status(200).json({
            status: true,
            data: assignment
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};  

exports.submitAssignment = async (req, res) => {
    try {
        const student_id = req.user?.id;
        const { assignment_id, questions } = req.body;
        const passingPercentage = 60;

        // 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Validation
        if (!assignment_id || !questions || !questions.length) {
            return res.status(400).json({
                status: false,
                message: "Assignment ID and questions are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid assignment_id"
            });
        }

      const passedAttempt = await AssignmentAttempt.findOne({
            student_id,
            assignment_id,
            is_passed: true
        });
        if (passedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this assignment. Re-attempt not allowed.",
                result: passedAttempt
            });
        }

        // 4. Get assignment
        const assignment = await Assignment.findOne({
            _id: assignment_id,
            is_published: true
        });

        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }

        // 5. Map questions (O(1) lookup)
        const questionMap = {};
        assignment.questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        let totalMarks = 0;
        let correctCount = 0;

        // 6. Evaluate answers
        const evaluatedQuestions = questions.map(q => {
            const dbQ = questionMap[q.question_id];

            if (!dbQ) return null;

            const isCorrect = dbQ.correct_answer === q.selected_ans;
            const marks = dbQ.marks || 1;

            if (isCorrect) {
                correctCount++;
                totalMarks += marks;
            }

            return {
                question_id: q.question_id,
                question: dbQ.question,
                selected_ans: q.selected_ans,
                correct_answer: dbQ.correct_answer, // added
                is_correct: isCorrect,
                marks_awarded: isCorrect ? marks : 0
            };

        }).filter(Boolean);

        const totalQuestions = assignment.questions.length;

        // 7. Calculate percentage
        const percentage = totalQuestions > 0
            ? (correctCount / totalQuestions) * 100
            : 0;

        const isPassed = percentage >= passingPercentage;

        // 8. Save attempt
        const attempt = await AssignmentAttempt.create({
            student_id,
            assignment_id,
            questions: evaluatedQuestions,
            total_marks: totalMarks,
            correct_answers: correctCount,
            total_questions: totalQuestions,
            percentage,
            is_passed: isPassed,
            // time_taken: time_taken || 0, // optional
            // start_time: new Date(), // optional (better if sent from frontend)
            // end_time: new Date()
        });

        // 9. Response (DO NOT expose correct_answer)
        return res.status(200).json({
            status: true,
            message: "Assignment submitted successfully",
            data: {
                attempt_id: attempt._id,
                total_questions: totalQuestions,
                correct_answers: correctCount,
                total_marks: totalMarks,
                percentage: percentage.toFixed(2),
                is_passed: isPassed
            }
        });

    } catch (error) {
        console.error("submitAssignment error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.startExam = async (req, res) => {
    try {
        const student_id = req.user?.id;

        // 1. Auth validation
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }

        const { course_id, batch_id } = req.query;

        // 2. Required fields
        if (!course_id || !batch_id) {
            return res.status(400).json({
                status: false,
                message: "course_id and batch_id are required"
            });
        }

        // 3. ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }

        // 4. Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }

        // 5. Check batch exists
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id
        });

        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }

        // 6. Get exam
        const exam = await OnlineExam.findOne({
            course_id,
            batch_id,
            is_published: true,
        }).select("-questions.correct_answer").lean();

        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }

        // 7. Prevent re-attempt if already passed
        const passedAttempt = await OnlineExamAttempt.findOne({
            student_id,
            exam_id: exam._id,
            is_passed: true
        });

        if (passedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this exam. Re-attempt not allowed.",
                result: passedAttempt
            });
        }

        // 8. Response
        return res.status(200).json({
            status: true,
            data: exam
        });

    } catch (error) {
        console.error("startExam error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const student_id = req.user?.id;
        const { exam_id, questions } = req.body;
        const passingPercentage = 60;

        // 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Validation
        if (!exam_id || !questions || !questions.length) {
            return res.status(400).json({
                status: false,
                message: "exam_id and questions are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(exam_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid exam_id"
            });
        }

        // 3. Prevent reattempt if already passed
        const passedAttempt = await OnlineExamAttempt.findOne({
            student_id,
            exam_id,
            is_passed: true
        });

        if (passedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this exam. Re-attempt not allowed.",
                result: passedAttempt
            });
        }

        // 4. Get exam
        const exam = await OnlineExam.findOne({
            _id: exam_id,
            is_published: true
        });

        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }

        // 5. Create question map
        const questionMap = {};
        exam.questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        let total_marks = 0;
        let correct_answers = 0;
        let total_possible_marks = 0;

        // 6. Evaluate answers
        const evaluatedQuestions = questions.map(q => {
            const dbQ = questionMap[q.question_id];
            if (!dbQ) return null;
            
            let is_correct = false;
            let marks_awarded = 0;
            
            console.log("3");
            // Only MCQ evaluated automatically
            if (dbQ.question_type === "mcq") {
                total_possible_marks += dbQ.marks || 1;

                if (q.answer === dbQ.correct_answer) {
                    console.log("answer is correct");
                    is_correct = true;
                    correct_answers++;
                    marks_awarded = dbQ.marks || 1;
                    total_marks += marks_awarded;
                }
            } 
            return {
                question_id: dbQ._id,
                question: dbQ.question,
                answer: q.answer,
                correct_answer: dbQ.correct_answer, // stored but not returned
                is_correct: dbQ.question_type === "mcq" ? is_correct : null,
                marks: dbQ.marks || 1,
                marks_awarded,
                question_type: dbQ.question_type
            };

        }).filter(Boolean);
 
        const total_questions = exam.questions.length;

        // 7. Calculate percentage (marks-based)
        const percentage = total_possible_marks > 0
            ? (total_marks / total_possible_marks) * 100
            : 0;

        const is_passed = percentage >= passingPercentage;

        // 8. Time calculation
        const end_time = new Date();
        let time_taken = 0;

    

        // 9. Save attempt
        const attempt = await OnlineExamAttempt.create({
            course_id: exam.course_id,
            batch_id: exam.batch_id,
            student_id,
            exam_id,
            questions: evaluatedQuestions,
            total_marks,
            correct_answers,
            total_questions,
            percentage,
            is_passed, 
            end_time,
            time_taken
        });

        // 10. Response (NO correct answers)
        return res.status(200).json({
            status: true,
            message: "Exam submitted successfully",
            data: {
                attempt_id: attempt._id,
                total_questions,
                correct_answers,
                total_marks,
                percentage: percentage.toFixed(2),
                is_passed
            }
        });

    } catch (error) {
        console.error("submitExam error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.getOnlineExam = async (req, res) => {
    try {
        const student_id = req.user?.id;

        // 1. Auth check
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }

        const { course_id, batch_id } = req.query;

        // 2. Required fields
        if (!course_id || !batch_id) {
            return res.status(400).json({
                status: false,
                message: "course_id and batch_id are required"
            });
        }

        // 3. ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }

        // 4. Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }

        // 5. Check student enrollment in batch
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id,
            "students.student_id": student_id
        });

        if (!batch) {
            return res.status(403).json({
                status: false,
                message: "You are not enrolled in this batch"
            });
        }

        // 6. Get published exam (hide correct answers)
        const exam = await OnlineExam.findOne({
            course_id,
            batch_id,
            is_published: true
        }).select("-questions.correct_answer").lean();

        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not available"
            });
        }

        // 7. Prevent re-attempt if already passed
        const passedAttempt = await OnlineExamAttempt.findOne({
            student_id,
            exam_id: exam._id,
            is_passed: true
        });

        if (passedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this exam. Re-attempt not allowed.",
                result: passedAttempt
            });
        }

        // 8. Response
        return res.status(200).json({
            status: true,
            data: exam
        });

    } catch (error) {
        console.error("getOnlineExam error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

 

exports.getPaymentHistory = async (req, res) => {
    try {
        const user_id = req.user?.id; // from JWT

        if (!user_id) {
            return res.status(400).json({
                status: false,
                message: "User not authenticated"
            });
        }

        const data = await Order.find({
            user_id: user_id, 
        })
        .sort({ createdAt: -1 }) // latest first
        .select(
            "order_number amount total_amount currency razorpay_payment_id payment_status order_status items createdAt"
        )
        .lean();

        return res.status(200).json({
            status: true,
            count: data.length,
            data
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


 

exports.getLatestAttemptsPerBatch = async (req, res) => {
    try {
        const student_id = req.user?.id; // from JWT

        if (!student_id) {
            return res.status(400).json({
                status: false,
                message: "student_id is required"
            });
        }

        const data = await OnlineExamAttempt.aggregate([
            {
                // ✅ Filter by student
                $match: {
                    student_id: new mongoose.Types.ObjectId(student_id)
                }
            },
            {
                // ✅ Sort latest first
                $sort: { createdAt: -1 }
            },
            {
                // ✅ Group by batch → pick latest attempt
                $group: {
                    _id: "$batch_id",
                    latest_attempt: { $first: "$$ROOT" }
                }
            },
            {
                // ✅ Replace root with actual data
                $replaceRoot: { newRoot: "$latest_attempt" }
            },

            // ✅ Optional: join course
            {
                $lookup: {
                    from: "courses",
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

            // ✅ Optional: join batch
            {
                $lookup: {
                    from: "coursebatches",
                    localField: "batch_id",
                    foreignField: "_id",
                    as: "batch"
                }
            },
            { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

            {
                // ✅ Clean response
                $project: {
                    _id: 1,
                    course_id: 1,
                    batch_id: 1,
                    exam_id: 1,
                    total_marks: 1,
                    percentage: 1,
                    is_passed: 1,
                    createdAt: 1,
                    course_name: "$course.name",
                    batch_title: "$batch.title"
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            count: data.length,
            data
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


exports.getRecordedCourseCertificate = async (req, res) => {
    try {
        const { exam_id } = req.query;
        const student_id = req.user?.id;

        const latest = await TestAttempt.findOne({
            student_id: student_id,
            test_id: exam_id
        })
        .sort({ createdAt: -1 })
        .populate("student_id", "name email")
        .populate({
            path: "test_id",
            select: "name course_id duration",
            populate: {
                path: "course_id",
                select: "course_name"
            }
        });

        if (!latest) {
            return res.status(404).json({
                status: false,
                message: "No attempt found"
            });
        }

        // ✅ Fetch order (course purchase)
        const order = await Order.findOne({
            user_id: student_id,
            "items.course_id": latest.test_id.course_id._id
        }).sort({ createdAt: 1 });

        const formattedData = {
            student_name: latest.student_id?.name || "",
            student_email: latest.student_id?.email || "",

            course_name: latest.test_id?.name || "", 

            // ✅ Start date from order
            course_start_date: order?.createdAt || "",

            // ✅ End date from exam completion
            course_end_date: latest.createdAt || "",

            total_marks: latest.total_marks || 0,
            percentage: latest.percentage || 0,
            is_passed: latest.is_passed || false, 
        };

        return res.status(200).json({
            status: true,
            data: formattedData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};




exports.getOnlineCourseCertificate = async (req, res) => {
    try {
        const { exam_id } = req.query;
        const student_id = req.user?.id;

        const latest = await OnlineExamAttempt.findOne({
            student_id: student_id,
            exam_id: exam_id
        })
        .sort({ createdAt: -1 })
        .populate("student_id", "name email")
        .populate({
            path: "exam_id",
            select: "title course_id batch_id duration",
            populate: [
                {
                    path: "course_id",
                    select: "name"
                },
                {
                    path: "batch_id",
                    select: "batch_name start_date end_date"
                }
            ]
        });

        if (!latest) {
            return res.status(404).json({
                status: false,
                message: "No attempt found"
            });
        }

        // ✅ Fetch order (course purchase)
        const order = await Order.findOne({
            user_id: student_id,
            "items.course_id": latest.exam_id.course_id._id
        }).sort({ createdAt: 1 });

        const formattedData = {
            student_name: latest.student_id?.name || "",
            student_email: latest.student_id?.email || "",

            course_name: latest.exam_id?.course_id?.name || "",

            // ✅ Start date (order)
            course_start_date: order?.createdAt || "",

            // ✅ End date (exam attempt)
            course_end_date: latest.createdAt || "",
            total_marks: latest.total_marks || 0,
            percentage: latest.percentage || 0,
            is_passed: latest.is_passed || false, 
        };

        return res.status(200).json({
            status: true,
            data: formattedData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};