const RecordedCourseTest = require("../../models/RecordedCourseTest");
const RecordedCourseTestQue = require("../../models/RecordedCourseTestQue");
const TestAttempt = require("../../models/TestAttempt");
const mongoose = require("mongoose");

exports.startTest = async (req, res) => {
    try{
        const user_id = req.user.id;
        const { course_id } = req.query;
       const mcq_test = await RecordedCourseTest.findOne({
            course_id: course_id
        })
        .populate({
            path: "questions",
            select: "-answer" // hide correct answer
        });
        res.status(200).json({
            status: true,
            data: mcq_test
        });
        
    }catch(error){
        res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
}

exports.submitTest = async (req, res) => {
    try{
        const user_id = req.user.id;
        const { test_id, questions } = req.body;
        const passingPercentage = 60;
           
         // 1. Basic validation
        if (!test_id || !questions || !questions.length) {
            return res.status(400).json({
                status: false,
                message: "Test ID and questions are required"
            });
        }
        const existingPassedAttempt = await TestAttempt.findOne({
            student_id: user_id,
            test_id: test_id,
            is_passed: true
        });
        if (existingPassedAttempt) {
            return res.status(400).json({
                status: false,
                message: "You have already passed this test. Re-attempt not allowed."
            });
        }
        // 2. Get all question IDs
        const questionIds = questions.map(q => q.question_id);
        //3 Fetch correct answer from db
        const dbQuestions = await RecordedCourseTestQue.find({
            _id: { $in: questionIds }
        });
        // 4 Convert to map for fast lookup
        const questionMap = {};
        dbQuestions.forEach(q => {
            questionMap[q._id] = q;
        });
        let totalMarks = 0;
        let correctCount = 0;
        // 5 Process each question
        const evaluatedQuestions = questions.map(q => {
            const dbQ = questionMap[q.question_id];
            if(!dbQ) return null;
            const isCorrect = dbQ.answer === q.selected_ans;
            if(isCorrect){ 
                correctCount++;
                totalMarks += dbQ.marks || 1; // default 1 mark
            } 
            return{
                question_id: q.question_id,
                question: dbQ.question,
                selected_ans: q.selected_ans,
                is_correct: isCorrect
            };
        }).filter(Boolean);     
        const totalQuestions = questions.length;
        //calculate percentage 
        const percentage = (correctCount / totalQuestions) * 100;
        // pass or fail
        const isPassed = percentage >= passingPercentage;
        // 6 Save Attemp
        const attempt = await TestAttempt.create({
            student_id: user_id,
            test_id,
            questions: evaluatedQuestions,
            total_marks: totalMarks,
            correct_answers: correctCount,
            total_questions: questions.length,
            percentage: percentage,
            is_passed: isPassed
        });
        // 7 response 
        return res.status(200).json({
            status: true,
            message: "Test submitted successfully",
            data: {
                attempt_id: attempt._id,
                total_question: questions.length,
                correct_answers: correctCount,
                total_marks: totalMarks,
                percentage: percentage.toFixed(2),
                is_passed: isPassed,
            }
        });
    }catch(error){
        res.status(500).json({
            status: false,
            error: error.message,
            message: "Something went wrong"
        });
    }
}

 

exports.recordedCourseTestAttempt = async (req, res) => {
    try {
        const student_id = req.user?.id;
        const { recorded_course_test_id } = req.query;

        // ✅ Validate user
        if (!student_id) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized user"
            });
        }

        // ✅ Validate recorded_course_test_id presence
        if (!recorded_course_test_id) {
            return res.status(400).json({
                status: false,
                message: "recorded_course_test_id is required"
            });
        }

        // ✅ Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(recorded_course_test_id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid recorded_course_test_id"
            });
        }

        // ✅ Fetch latest attempt (sorted by newest)
        const attempt = await TestAttempt.findOne({
            student_id,
            test_id: recorded_course_test_id
        }).sort({ createdAt: -1 }); // latest attempt

        // ✅ If no attempt found
        if (!attempt) {
            return res.status(404).json({
                status: false,
                message: "No test attempt found"
            });
        }

        // ✅ Success response
        res.status(200).json({
            status: true,
            data: attempt
        });

    } catch (error) {
        console.error("recordedCourseTestAttempt error:", error.message);
        res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};