const mongoose = require("mongoose");
const RecordedCourseTest = require("./RecordedCourseTest");

const RecordedCourseTestQueSchema = new mongoose.Schema({
    course_id : {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        rel: "Course"
    },
    course_test_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        rel: "RecordedCourseTest"
    },
    question: String,
    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,
    answer: String,
    marks: Number
}, {timestamp: true});


module.exports = mongoose.model("RecordedCourseTestQue", RecordedCourseTestQueSchema, 'recorded_course_test_que');
