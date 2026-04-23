// const OnlineExam = require("../../models/OnlineExam");


// exports.scheduledExam = async (req, res) => {
//     try{
//         const exams = await OnlineExam.find();
//         res.render("backend/scheduled_exams/index");
//     }catch(error){
//         res.status(500).json({
//             status: false,
//             message: "Something went wrong",
//             error: error.message
//         });
//     }
// }