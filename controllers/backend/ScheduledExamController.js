const OnlineExam = require("../../models/OnlineExam");


exports.index = async (req, res) => {
    try{
        const exams = await OnlineExam.find().populate("batch_id").populate("course_id").populate("teacher_id");
        res.render("backend/scheduled_exams/index", {
            exams
        });
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            status: true,
            message: "Something went wrong"
        });
    }
}

exports.view = async (req, res) => {
    try{
        const exam_id = req.params.id;
        const exam = await OnlineExam.findById(exam_id); 
        res.render("backend/scheduled_exams/view",
            {
                exam
            }
        );
    }catch(error){
        console.error(error.message);
            res.status(500).json({
                status: false,
                message: "Something went wrong"
            });
        }
    }
