const OnlineCourseOrder = require("../../models/OnlineCourseOrder");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Course = require("../../models/Course");
const CourseBatch = require("../../models/CourseBatch");
const mongoose = require("mongoose");
const Assignment =  require("../../models/Assignment");
const OnlineExam = require("../../models/OnlineExam");
const validator = require("validator");
const { SendMail } = require("../../config/SendMail");
const { StudentBatchAssignedEmail } = require("../../emails/StudentBatchAssignedEmail");
const DoubtSession = require("../../models/DoubtSession");


exports.teacherDashboard = async (req, res) => {
    try {
        const teacher_id = req.user?.id;

        if (!teacher_id) {
            return res.status(400).json({
                status: false,
                message: "Teacher not authenticated"
            });
        }

        const teacherObjectId = new mongoose.Types.ObjectId(teacher_id);

        // ✅ Total Batches
        const total_batches = await CourseBatch.countDocuments({
            teacher_id: teacherObjectId
        });

        // ✅ Total Courses (unique from batches)
        const courses = await CourseBatch.aggregate([
            {
                $match: { teacher_id: teacherObjectId }
            },
            {
                $group: {
                    _id: "$course_id"
                }
            }
        ]);
        const total_courses = courses.length;

        // ✅ Total Students (from doubts)
        const students = await DoubtSession.aggregate([
            {
                $match: { teacher_id: teacherObjectId }
            },
            {
                $group: {
                    _id: "$student_id"
                }
            }
        ]);
        const total_students = students.length;

        // ✅ Total Doubts
        const total_doubts = await DoubtSession.countDocuments({
            teacher_id: teacherObjectId
        });

        // ✅ Recent Doubts
        const recent_doubts = await DoubtSession.find({
            teacher_id: teacherObjectId
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("message student_id createdAt")
        .lean();

        return res.status(200).json({
            status: true,
            data: {
                total_courses,
                total_batches,
                total_students,
                total_doubts,
                recent_doubts
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
        const {
            name,
            email,
            phone,
            gender,
            password,
            qualification,
            experience,
            address,
        } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                status: false,
                message: "All fields (name, email, phone, password) are required"
            });
        }

        const trimmedName = name.trim();

        if (!validator.isLength(trimmedName, { min: 2, max: 50 })) {
            return res.status(400).json({
                status: false,
                message: "Name must be between 2 and 50 characters"
            });
        }

        if (!validator.isAlpha(trimmedName.replace(/\s/g, ""))) {
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
                message: "Weak password"
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
            name: trimmedName,
            email: normalizedEmail,
            phone,
            gender,
            password: hashedPassword,
            user_role: 1, //Teacher
            qualification,
            experience,
            address,
        });

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
            message: "Teacher registered successfully",
            token,
            data: userData,
            user_role: "teacher",
            user_role_id: user.user_role,
        });

    } catch (error) {
        console.error("Register Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }
         if (user.user_role != 1) {
            return res.status(400).json({
                status: false,
                message: "Unauthorized User"
            });
        }
        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }
        // 3. Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
            user_role: "teacher",
            user_role_id: user.user_role,
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Server error",
              error:error.message
        });
    }
};

exports.addTeacherAvailability = async (req, res) => {
    try {
        const { teacherId, weekly_availability } = req.body;

        if (!teacherId || !weekly_availability) {
            return res.status(400).json({
                status: false,
                message: "teacherId and availability are required"
            });
        }

        const teacher = await User.findById(teacherId);

        if (!teacher || teacher.user_role !== 1) {
            return res.status(404).json({
                status: false,
                message: "Teacher not found"
            });
        }

        // OPTIONAL: validate days
        const validDays = [
            "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday", "Sunday"
        ];

        for (let dayObj of weekly_availability) {
            if (!validDays.includes(dayObj.day)) {
                return res.status(400).json({
                    status: false,
                    message: `Invalid day: ${dayObj.day}`
                });
            }
        }

        // Save / overwrite availability
        teacher.weekly_availability = weekly_availability;

        await teacher.save();

        return res.status(200).json({
            status: true,
            message: "Availability updated successfully",
            data: teacher.weekly_availability
        });

    } catch (error) {
        console.error("Availability Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};

exports.getTeacherAvailability = async (req, res) => {
    try {
        const { teacherId } = req.params;

        if (!teacherId) {
            return res.status(400).json({
                status: false,
                message: "teacherId is required"
            });
        }

        const teacher = await User.findById(teacherId)
            .select("name email weekly_availability user_role");

        if (!teacher || teacher.user_role !== 1) {
            return res.status(404).json({
                status: false,
                message: "Teacher not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Availability fetched successfully",
            data: {
                teacherId: teacher._id,
                name: teacher.name,
                email: teacher.email,
                availability: teacher.weekly_availability || []
            }
        });

    } catch (error) {
        console.error("Get Availability Error:", error.message);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};

exports.orders = async (req, res) => {
    try{
        const teacher_id = req.user?.id;
        const orders = await OnlineCourseOrder.find({
            teacher_id: teacher_id,
            // payment_status: "paid",
            // order_status: "placed"
        }).populate({   
            path: "student_id",
            select: "name email phone"
        }).populate({
            path: "course_id",
            select: "name type language certificate total_no_of_lession slug thumbnail"
        }).select("_id");
        if(orders){
            return res.status(200).json({
                status: true,
                data: orders, 
            });
        }else{
            return res.status(200).json({
                status: false,
                message: "No Order availabel"
            });
        }
    }catch(error){
        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.liveSessions = async (req, res) => {
    try{
        const teacher_id = req.user.id;
       const course_ids = await OnlineCourseOrder.distinct("course_id", {
            teacher_id: teacher_id,
            // payment_status: "paid",
            // order_status: "placed"
        });
        const courses = await Course.find({
            _id: { $in: course_ids }
        });
        return res.status(200).json({
            status: true,
            data: courses
        });
    }catch(error){
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
};

exports.creatBatch = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: Teacher not found"
            });
        }

        const { title, course_id, start_time, end_time, session, start_date } = req.body;
        //Required field validation
        if (!title || !course_id || !start_time || !end_time || !session || !start_date) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }

        //Type & format validation
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id"
            });
        }

        // Validate dates
        const startDateObj = new Date(start_date);
        const startTimeObj = new Date(start_time);
        const endTimeObj = new Date(end_time);

        // if (isNaN(startDateObj) || isNaN(startTimeObj) || isNaN(endTimeObj)) {
        if (isNaN(startDateObj)) {
            return res.status(400).json({
                status: false,
                message: "Invalid date/time format in start date"
            });
        }
        if (isNaN(startTimeObj)) {
            return res.status(400).json({
                status: false,
                message: "Invalid date/time format in start time"
            });
        }
        if (isNaN(endTimeObj)) {
            return res.status(400).json({
                status: false,
                message: "Invalid date/time format in end time"
            });
        }

        // ✅ 4. Logical validation
        if (endTimeObj <= startTimeObj) {
            return res.status(400).json({
                status: false,
                message: "End time must be greater than start time"
            });
        }

        if (startDateObj < new Date().setHours(0,0,0,0)) {
            return res.status(400).json({
                status: false,
                message: "Start date cannot be in the past"
            });
        }

        // ✅ 5. Course existence check
        const courseExists = await Course.findById(course_id);
        if (!courseExists) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }

        
        // ✅ 7. Duplicate batch prevention (optional but important)
        const existingBatch = await CourseBatch.findOne({
            course_id,
            teacher_id,
            start_date: startDateObj,
            start_time: startTimeObj
        });

        if (existingBatch) {
            return res.status(400).json({
                status: false,
                message: "Batch already exists for this course at the same time"
            });
        }

        // ✅ 8. Create batch
        await CourseBatch.create({
            title: title.trim(),
            course_id,
            teacher_id,
            start_time: startTimeObj,
            end_time: endTimeObj,
            start_date: startDateObj,
            session: session.toLowerCase(),
            status: "upcoming"
        });

        return res.status(201).json({
            status: true,
            message: "Batch created successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.getAllBatch = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id } = req.query;
        //Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized: Teacher not found"
            });
        }
        // Required field validation
        if (!course_id) {
            return res.status(400).json({
                status: false,
                message: "course_id is required"
            });
        }
        // ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id"
            });
        }
        // Fetch data
        const all_batches = await CourseBatch.find({
            teacher_id,
            course_id
        }).sort({ createdAt: -1 });
        // Handle empty result
        if (!all_batches || all_batches.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No batches found",
                data: []
            });
        }
        // Success response
        return res.status(200).json({
            status: true,
            count: all_batches.length,
            data: all_batches
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.addStudentInBatch = async (req, res) => {
    try {
        const { student_id, batch_id } = req.body;
        // ✅ 1. Validation
        if (!student_id || !batch_id) {
            return res.status(400).json({
                status: false,
                message: "student_id and batch_id are required"
            });
        }
        // ✅ 2. Check student exists
        const student = await User.findById(student_id);
        if (!student) {
            return res.status(404).json({
                status: false,
                message: "Student not found"
            });
        }
        // ✅ 3. Check batch exists
        const batch = await CourseBatch.findById(batch_id);
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found"
            });
        }

        // ✅ 4. Prevent duplicate student
        const alreadyAdded = batch.students.find(
            s => s.student_id.toString() === student_id
        );

        if (alreadyAdded) {
            return res.status(400).json({
                status: false,
                message: "Student already added in this batch"
            });
        }

        // Push student into array
       const batch_detail =  await CourseBatch.findByIdAndUpdate(
            batch_id,
            {
                $push: {
                    students: {
                        student_id: student._id,
                        name: student.name,
                        email: student.email
                    }
                }
            },
            { new: true }
        ).populate("course_id").populate("teacher_id");

            const formatDate = (date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            };
            const formatTime = (date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            };
        // res.send(batch_detail);
            const teacher = batch_detail.teacher_id;
            const course = batch_detail.course_id;

            const studentData = {
                name: student.name,
                email: student.email
            };

            const batchData = {
                course_name: course.name,
                course_type: course.type,
                price: course.price,
                batch_name: batch_detail.title,
                start_date: formatDate(batch_detail.start_date),
                timing: formatTime(batch_detail.start_time)
            }; 
            // SendMail({
            //     to: student.email,
            //     subject: "Your Batch & Teacher Assigned - Vidya Malika 🎓",
            //     html: StudentBatchAssignedEmail({
            //         student: studentData,
            //         teacher: teacher,
            //         batch: batchData
            //     })
            // }).catch(err => {
            //     console.error("Student Email Error:", err.message);
            // });

        //Response
        return res.status(200).json({
            status: true,
            message: "Student added successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};



exports.addClassInBatch = async (req, res) => {
    try {
        const { batch_id, title, meeting_link, time, date } = req.body;
        //Validation
        if (!batch_id || !meeting_link || !time || !date) {
            return res.status(400).json({
                status: false,
                message: "batch_id, meeting_link, time, and date are required"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(batch_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid batch_id"
            });
        }
        //Validate Date
        const classTime = new Date(time);
        const classDate = new Date(date);
        if (isNaN(classDate)) {
            return res.status(400).json({
                status: false,
                message: "Invalid date format",
                data: classTime
            });
        }
        if (isNaN(classTime)) {
            return res.status(400).json({
                status: false,
                message: "Invalid time format",
                data: classTime
            });
        }
        //Check batch exists
        const batch = await CourseBatch.findById(batch_id);
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found"
            });
        }
        //Optional: Prevent duplicate class (same date + time)
        const alreadyExists = batch.classes.find(
            c =>
                new Date(c.time).getTime() === classTime.getTime() &&
                new Date(c.date).toDateString() === classDate.toDateString()
        );
        if (alreadyExists) {
            return res.status(400).json({
                status: false,
                message: "Class already exists at this date & time"
            });
        }
        //Add class
        await CourseBatch.findByIdAndUpdate(
            batch_id,
            {
                $push: {
                    classes: {
                        title: title || "Class",
                        meeting_link,
                        time: classTime,
                        date: classDate,
                    }
                }
            }
        );
        //Response
        return res.status(200).json({
            status: true,
            message: "Class added successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
}; 

exports.cancelBatchClass = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { batch_id, index_number } = req.body;
        // Validation
        if (!batch_id || index_number === undefined) {
            return res.status(400).json({
                status: false,
                message: "batch_id and index_number are required"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(batch_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid batch_id"
            });
        }
        // Get batch
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            teacher_id: teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found"
            });
        }
        // Check index exists
        if (
            index_number < 0 ||
            index_number >= batch.classes.length
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid class index"
            });
        }
        // Update class_status
        batch.classes[index_number].class_status = "cancelled";
        await batch.save();
        // Response
        return res.status(200).json({
            status: true,
            message: "Class cancelled successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        //Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { course_id, batch_id, due_date, title, questions } = req.body;
        //Required field validation
        if (!course_id || !batch_id || !due_date || !title || !questions) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }
        //ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }
        //Title validation
        if (typeof title !== "string" || title.trim().length < 5) {
            return res.status(400).json({
                status: false,
                message: "Title must be at least 3 characters long"
            });
        }
        //Due date validation
        const parsedDueDate = new Date(due_date);
        if (isNaN(parsedDueDate.getTime())) {
            return res.status(400).json({
                status: false,
                message: "Invalid due_date format"
            });
        }
        if (parsedDueDate < new Date()) {
            return res.status(400).json({
                status: false,
                message: "Due date cannot be in the past"
            });
        }
        //Questions validation
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Questions must be a non-empty array"
            });
        }
        // Optional: validate each question structure
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            if (!q.question || typeof q.question !== "string") {
                return res.status(400).json({
                    status: false,
                    message: `Question ${i + 1} is invalid`
                });
            }
        }
        //Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }
        //Check batch exists and belongs to teacher & course
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id: course_id,
            teacher_id: teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Check if assignment already exists
        const existingAssignment = await Assignment.findOne({
            teacher_id,
            course_id,
            batch_id,
        });
        if (existingAssignment) {
            return res.status(409).json({
                status: false,
                message: "Assignment for this batch already exists"
            });
        }
        //Create assignment
        const assignment = await Assignment.create({
            teacher_id,
            course_id,
            batch_id,
            due_date: parsedDueDate,
            title: title.trim(),
            questions
        });
        return res.status(201).json({
            status: true,
            message: "Assignment created successfully",
            data: assignment
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        } 
        const { course_id, batch_id, due_date, title, questions, assignment_id } = req.body;
        // Assignment ID validation
        if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid assignment_id"
            });
        }
        // Required field validation
        if (!course_id || !batch_id || !due_date || !title || !questions) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
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
        // Check assignment exists & belongs to teacher
        const assignment = await Assignment.findOne({
            _id: assignment_id,
            teacher_id
        });
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found or unauthorized"
            });
        }
        // Title validation
        if (typeof title !== "string" || title.trim().length < 5) {
            return res.status(400).json({
                status: false,
                message: "Title must be at least 5 characters long"
            });
        }
        // Due date validation
        const parsedDueDate = new Date(due_date);
        if (isNaN(parsedDueDate.getTime())) {
            return res.status(400).json({
                status: false,
                message: "Invalid due_date format"
            });
        }
        // if (parsedDueDate < new Date()) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Due date cannot be in the past"
        //     });
        // }
        // Questions validation
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Questions must be a non-empty array"
            });
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || typeof q.question !== "string") {
                return res.status(400).json({
                    status: false,
                    message: `Question ${i + 1} is invalid`
                });
            }
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
            teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Duplicate check (exclude current assignment)
        const duplicate = await Assignment.findOne({
            _id: { $ne: assignment_id },
            teacher_id,
            course_id,
            batch_id,
        });
        if (duplicate) {
            return res.status(409).json({
                status: false,
                message: "Another assignment with this title already exists"
            });
        }
        // Update assignment
        assignment.course_id = course_id;
        assignment.batch_id = batch_id;
        assignment.due_date = parsedDueDate;
        assignment.title = title.trim();
        assignment.questions = questions;
        await assignment.save();
        return res.status(200).json({
            status: true,
            message: "Assignment updated successfully",
            data: assignment
        });

    } catch (error) {
        // Handle duplicate index error (if using unique index)
        if (error.code === 11000) {
            return res.status(409).json({
                status: false,
                message: "Duplicate assignment detected"
            });
        }
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.getAssignment = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
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
            teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Get assignment
        const assignment = await Assignment.findOne({
            teacher_id,
            course_id,
            batch_id
        });
        // Not found case
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }
        return res.status(200).json({
            status: true,
            data: assignment
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};  

exports.createOnlineExam = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        //Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { course_id, batch_id, exam_date, exam_time, duration, title, questions } = req.body;
        //Required field validation
        if (!course_id || !batch_id || !title || !duration || !questions) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }
        //ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or batch_id"
            });
        }
        //Title validation
        if (typeof title !== "string" || title.trim().length < 5) {
            return res.status(400).json({
                status: false,
                message: "Title must be at least 3 characters long"
            });
        }
        //Due date validation
        // const examDate = new Date(exam_date);
        // if (isNaN(examDate.getTime())) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Invalid exam date format"
        //     });
        // }
        // if (examDate < new Date()) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Exam date cannot be in the past"
        //     });
        // }
        //Questions validation
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Questions must be a non-empty array"
            });
        }
        // Optional: validate each question structure
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            if (!q.question || typeof q.question !== "string") {
                return res.status(400).json({
                    status: false,
                    message: `Question ${i + 1} is invalid`
                });
            }
        }
        //Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }
        //Check batch exists and belongs to teacher & course
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id: course_id,
            teacher_id: teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Check if assignment already exists
        const existingExam = await OnlineExam.findOne({
            teacher_id,
            course_id,
            batch_id,
        });
        if (existingExam) {
            return res.status(409).json({
                status: false,
                message: "Exam for this batch already exists"
            });
        }
        //Create assignment
        const exam = await OnlineExam.create({
            teacher_id,
            course_id,
            batch_id,
            // exam_date,
            // exam_time,
            duration,
            title: title.trim(),
            questions,
            is_published: false,
        });
        return res.status(201).json({
            status: true,
            message: "Exam created successfully",
            data: exam
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.updateOnlineExam = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { exam_id, course_id, batch_id, duration, title, questions } = req.body;
        // Required fields
        if (!exam_id || !course_id || !batch_id || !duration || !title || !questions) {
            return res.status(400).json({
                status: false,
                message: "All fields are required",
            });
        }
        // ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(exam_id) ||
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(batch_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid IDs provided"
            });
        }
        // Check exam exists & belongs to teacher
        const exam = await OnlineExam.findOne({
            _id: exam_id,
            teacher_id
        });
        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found or unauthorized"
            });
        }
        // Title validation
        if (typeof title !== "string" || title.trim().length < 5) {
            return res.status(400).json({
                status: false,
                message: "Title must be at least 5 characters long"
            });
        }
        // Date validation
        // const examDate = new Date(exam_date);
        // if (isNaN(examDate.getTime())) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Invalid exam_date format"
        //     });
        // }
        // // Optional: prevent past exam update
        // if (examDate < new Date()) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Exam date cannot be in the past"
        //     });
        // }
        // Time validation (basic)
        // if (!exam_time || typeof exam_time !== "string") {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Invalid exam_time"
        //     });
        // }
        // Duration validation
        if (isNaN(duration) || Number(duration) <= 0) {
            return res.status(400).json({
                status: false,
                message: "Duration must be a positive number"
            });
        }
        // Questions validation
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Questions must be a non-empty array"
            });
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || typeof q.question !== "string") {
                return res.status(400).json({
                    status: false,
                    message: `Question ${i + 1} is invalid`
                });
            }
        }
        // Check course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                status: false,
                message: "Course not found"
            });
        }
        // Check batch ownership
        const batch = await CourseBatch.findOne({
            _id: batch_id,
            course_id,
            teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Duplicate check (exclude current exam)
        const duplicate = await OnlineExam.findOne({
            _id: { $ne: exam_id },
            teacher_id,
            course_id,
            batch_id,
            title: title.trim()
        });
        if (duplicate) {
            return res.status(409).json({
                status: false,
                message: "Another exam with this title already exists"
            });
        }
        // Update exam
        exam.course_id = course_id;
        exam.batch_id = batch_id;
        // exam.exam_date = examDate;
        // exam.exam_time = exam_time;
        exam.duration = duration;
        exam.title = title.trim();
        exam.questions = questions;
        await exam.save();
        return res.status(200).json({
            status: true,
            message: "Exam updated successfully",
            data: exam
        });
    } catch (error) {
        console.error("Update Exam Error:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                status: false,
                message: "Duplicate exam detected"
            });
        }
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.publishOnlineExam = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id, exam_id, is_publish } = req.body;

        // 1. Auth check
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // 2. Required fields
        if (!course_id || !exam_id || typeof is_publish === "undefined") {
            return res.status(400).json({
                status: false,
                message: "course_id, exam_id and is_publish are required"
            });
        }

        // 3. ObjectId validation
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(exam_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or exam_id"
            });
        }

        // 4. Boolean validation
        if (typeof is_publish !== "boolean") {
            return res.status(400).json({
                status: false,
                message: "is_publish must be true or false"
            });
        }

        // 5. Find & update in one query (secure)
        const exam = await OnlineExam.findOneAndUpdate(
            {
                _id: exam_id,
                course_id: course_id,
                teacher_id: teacher_id
            },
            {
                is_published: is_publish
            },
            {
                new: true
            }
        ).lean();

        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found or not authorized"
            });
        }

        return res.status(200).json({
            status: true,
            message: `Exam ${is_publish ? "published" : "unpublished"} successfully`,
            data: exam
        });

    } catch (error) {
        console.error("Publish Exam Error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.deleteAssignmentQuestion = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { assignment_id, question_index_number } = req.body;
        // Required fields
        if (!assignment_id || question_index_number === undefined) {
            return res.status(400).json({
                status: false,
                message: "assignment_id and question_index_number are required"
            });
        }
        // ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid assignment_id"
            });
        }
        // Index validation
        const index = Number(question_index_number);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                status: false,
                message: "Invalid question index"
            });
        }
        // Find assignment (ownership check)
        const assignment = await Assignment.findOne({
            _id: assignment_id,
            teacher_id
        });
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found or unauthorized"
            });
        }
        // Check questions exist
        if (!Array.isArray(assignment.questions) || assignment.questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "No questions available to delete"
            });
        }
        // Index bounds check
        if (index >= assignment.questions.length) {
            return res.status(400).json({
                status: false,
                message: "Question index out of range"
            });
        }
        // Optional: prevent deleting last question
        if (assignment.questions.length === 1) {
            return res.status(400).json({
                status: false,
                message: "Cannot delete last question. Assignment must have at least one question"
            });
        }
        // Remove question
        assignment.questions.splice(index, 1);
        await assignment.save();
        return res.status(200).json({
            status: true,
            message: "Question deleted successfully",
            data: assignment.questions
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

exports.deleteExamQuestion = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { online_exam_id, question_index_number } = req.body;
        // Required fields
        if (!online_exam_id || question_index_number === undefined) {
            return res.status(400).json({
                status: false,
                message: "online_exam_id and question_index_number are required"
            });
        }
        // ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(online_exam_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid online_exam_id"
            });
        }
        // Index validation
        const index = Number(question_index_number);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                status: false,
                message: "Invalid question index"
            });
        }
        // Find exam (ownership check)
        const exam = await OnlineExam.findOne({
            _id: online_exam_id,
            teacher_id
        });
        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found or unauthorized"
            });
        }
        // Questions exist check
        if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
            return res.status(400).json({
                status: false,
                message: "No questions available to delete"
            });
        }
        // Index bounds check
        if (index >= exam.questions.length) {
            return res.status(400).json({
                status: false,
                message: "Question index out of range"
            });
        }
        // Optional: prevent deleting last question
        if (exam.questions.length === 1) {
            return res.status(400).json({
                status: false,
                message: "Cannot delete last question. Exam must have at least one question"
            });
        }
        // Optional (recommended): prevent deletion if exam already started
        const now = new Date();
        const examDateTime = new Date(`${exam.exam_date} ${exam.exam_time}`);

        if (examDateTime <= now) {
            return res.status(400).json({
                status: false,
                message: "Cannot modify questions after exam has started"
            });
        }
        // Remove question
        exam.questions.splice(index, 1);
        await exam.save();
        return res.status(200).json({
            status: true,
            message: "Question deleted successfully",
            data: exam.questions
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};


exports.deleteAssignment = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { assignment_id } = req.body;
        // Required field
        if (!assignment_id) {
            return res.status(400).json({
                status: false,
                message: "assignment_id is required"
            });
        }
        // ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid assignment_id"
            });
        }
        // Check assignment exists & ownership
        const assignment = await Assignment.findOne({
            _id: assignment_id,
            teacher_id
        });
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found or unauthorized"
            });
        }
        // Optional: prevent delete if students submitted
        // const submissions = await Submission.findOne({ assignment_id });
        // if (submissions) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Cannot delete assignment with submissions"
        //     });
        // }
        // Delete assignment
        await Assignment.deleteOne({ _id: assignment_id });
        return res.status(200).json({
            status: true,
            message: "Assignment deleted successfully"
        });
    } catch (error) {
        console.error("Delete Assignment Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};


exports.deleteOnlineExam = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access"
            });
        }
        const { online_exam_id } = req.body;
        // Required field
        if (!online_exam_id) {
            return res.status(400).json({
                status: false,
                message: "online_exam_id is required"
            });
        }
        // ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(online_exam_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid online_exam_id"
            });
        }
        // Check exam exists & ownership
        const exam = await OnlineExam.findOne({
            _id: online_exam_id,
            teacher_id
        });
        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found or unauthorized"
            });
        }
        // Prevent delete if exam already started
        const now = new Date();
        const examDateTime = new Date(`${exam.exam_date} ${exam.exam_time}`);

        if (examDateTime <= now) {
            return res.status(400).json({
                status: false,
                message: "Cannot delete exam after it has started"
            });
        }
        // Optional: prevent delete if students attempted
        // const attempts = await ExamAttempt.findOne({ online_exam_id });
        // if (attempts) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Cannot delete exam with student attempts"
        //     });
        // }
        // Delete exam
        await OnlineExam.deleteOne({ _id: online_exam_id });
        return res.status(200).json({
            status: true,
            message: "Exam deleted successfully"
        });
    } catch (error) {
        console.error("Delete Exam Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};


exports.getOnlineExam = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        // Auth validation
        if (!teacher_id) {
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
            teacher_id
        });
        if (!batch) {
            return res.status(404).json({
                status: false,
                message: "Batch not found or not authorized"
            });
        }
        // Get assignment
        const exam = await OnlineExam.findOne({
            teacher_id,
            course_id,
            batch_id
        });
        // Not found case
        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }
        return res.status(200).json({
            status: true,
            data: exam
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
}; 

exports.publishAssignment = async (req, res) => {
    try {
        const teacher_id = req.user?.id;
        const { course_id, assignment_id, is_publish } = req.body;

        // ✅ 1. Auth check
        if (!teacher_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        // ✅ 2. Required fields
        if (!course_id || !assignment_id || typeof is_publish === "undefined") {
            return res.status(400).json({
                status: false,
                message: "course_id, assignment_id and is_publish are required"
            });
        }

        // ✅ 3. Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(course_id) ||
            !mongoose.Types.ObjectId.isValid(assignment_id)
        ) {
            return res.status(400).json({
                status: false,
                message: "Invalid course_id or assignment_id"
            });
        }

        // ✅ 4. Validate is_publish (must be boolean)
        if (typeof is_publish !== "boolean") {
            return res.status(400).json({
                status: false,
                message: "is_publish must be true or false"
            });
        }

        // ✅ 5. Find assignment
        const assignment = await Assignment.findById(assignment_id);

        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }

        // ✅ 6. Check assignment belongs to course
        if (assignment.course_id.toString() !== course_id) {
            return res.status(400).json({
                status: false,
                message: "Assignment does not belong to this course"
            });
        }

        // ✅ 7. Check teacher ownership (important security)
        if (assignment.teacher_id.toString() !== teacher_id) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to update this assignment"
            });
        }

        // ✅ 8. Update assignment
        assignment.is_published = is_publish;
        await assignment.save();

        return res.status(200).json({
            status: true,
            message: `Assignment ${is_publish ? "published" : "unpublished"} successfully`,
            data: assignment
        });

    } catch (error) {
        console.error("Publish Assignment Error:", error.message);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};