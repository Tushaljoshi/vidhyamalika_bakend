const CommonFeedback = require("../../models/CommonFeedback");

exports.store = async (req, res) => {
    try{
        const { student_id, feedback } = req.body;
        await CommonFeedback.create({
            student_id,
            feedback
        });
        res.status(201).json({
            status: true,
            message: "Feedback submitted successfully"
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
}