// const RecordedCourseVideo = require("../../models/RecordedCourseVideo");
// const Course = require("../../models/Course");
// const fs = require("fs");
// const path = require("path");

// exports.index = async (req, res) => {
//     try{
//         const courses = await Course.find();
//         const main_categories = MainCategory.find(
//             { status: true }
//         );
//        res.render("backend/course/recorded/index", {
//         courses,
//         main_categories
//     }); 
//     }catch(error){
//         req.flash("error", "Something went wrong");
//         res.redirect('/course/recorded-course');
//     }
// }

// exports.create = async (req, res) => {
//     try{
//         res.render("backend/course/recorded/create");
//     }catch(error){
//     req.flash("error", "Something went wrong");
//     res.redirect("/course/recorded-course");
//     }
// }

// exports.store = async (req, res) => {
//     try{ 
//         const {
//             course_name,
//             duration_hrs,
//             duration_min,
//             language,
//             certificate,
//             no_of_lesson,
//             price,
//             sale_price,
//             lesson,
//             video_type,
//             video_url
//         } = req.body;
//         const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].filename : null;
//         const videoFiles = req.files["video_file[]"] || [];
//         // 1️⃣ Save Course
//         const course = await Course.create({
//             name: course_name,
//             type: 'recorded',
//             total_hrs: duration_hrs,
//             total_min: duration_min,
//             language,
//             certificate,
//             total_no_of_lession: no_of_lesson,
//             price,
//             sale_price,
//             thumbnail: "/uploads/recorded_course/"+thumbnail
//         });
//         let fileIndex = 0;
//             // 2️⃣ Save Lessons
//         for (let i = 0; i < lesson.length; i++) {
//             let videoFile = null;
//             let videoUrl = null;
//             // dynamic radio name
//             let videoType = req.body[`video_type_${i+1}`];
//             if(videoType === "video_url"){
//                 videoUrl = video_url[i];
//             }
//             if(videoType === "video_file"){
//                 videoFile = videoFiles[fileIndex].filename;
//                 fileIndex++;
//             }
//             await RecordedCourseVideo.create({
//                 lession_number: lesson[i],
//                 video_type: videoType,
//                 video_file: "/uploads/recorded_course/"+videoFile,
//                 video_url: videoUrl,
//                 course_id: course._id
//             });
//         }
//         req.flash("success", "Course Added Successfully");
//         res.redirect('/course/recorded-course');
//     }catch(error){
//         req.flash("error", "Something went wrong");
//         res.redirect("/course/recorded-course");
//     }
// }
    
// exports.edit = async (req, res) => {
//     try{
//         const id = req.params.id;
//         const course = await Course.findById(id);
//         const videos = await RecordedCourseVideo.find({
//             course_id : id
//         });  
//         res.render("backend/course/recorded/edit", {
//             course, videos
//         });
//     }catch(error){
//         req.flash("error", "Something went wrong");
//         res.redirect("/course/recorded-course");
//     } 
// }

// exports.update = async (req, res) => {
//     try{
//         const {
//             course_id,
//             course_name,
//             duration_hrs,
//             duration_min,
//             language,
//             certificate,
//             no_of_lesson,
//             price,
//             sale_price,
//             lesson,
//             video_type,
//             video_url,
//             recorded_video_id
//         } = req.body;
//         let course = await Course.findById(course_id);
//             await Course.findByIdAndUpdate(
//                 course_id,
//                 {
//                     name: course_name,
//                     total_hrs: duration_hrs,
//                     total_min: duration_min,
//                     language,
//                     certificate,
//                     total_no_of_lession: no_of_lesson,
//                     price,
//                     sale_price
//                 }
//             ); 
           
//                 if(req.files.thumbnail){
//                     await Course.findByIdAndUpdate(
//                         course_id,
//                         {
//                             thumbnail: "/uploads/recorded_course/"+req.files.thumbnail[0].filename
//                         }
//                     );
//                     const oldImage = path.join(
//                         __dirname,
//                         "../..",
//                         "public",
//                         course.thumbnail
//                     ); 
//                     if(fs.existsSync(oldImage)){
//                         fs.unlinkSync(oldImage);
//                     } 
//                 } 
//                 for (let i = 0; i < lesson.length; i++) { 
//                     let videoFile = null;
//                     let videoUrl = null;

//                     let videoType = req.body[`video_type_${i+1}`];

//                     if (videoType === "video_url") {
//                         videoUrl = 'video_url';
//                     } 
//                     const existingLesson = recorded_video_id && recorded_video_id[i]
//                         ? await RecordedCourseVideo.findById(recorded_video_id[i])
//                         : null;

//                     let updateData = {
//                         video_type: videoType
//                     };

//                     if (videoType === "video_url") {
//                         updateData.video_url = videoUrl;
//                         updateData.video_file = null;
//                     }

//                     if (req.files[`video_file_${i+1}`]) {
//                         videoFile = req.files[`video_file_${i+1}`][0].filename; 
//                         updateData.video_file = "/uploads/recorded_course/" + videoFile;
//                         updateData.video_url = null; 
//                     }

//                     if (existingLesson) {

//                         await RecordedCourseVideo.findByIdAndUpdate(
//                             existingLesson._id,
//                             {
//                                 lession_number: lesson[i],
//                                 ...updateData
//                             }
//                         );

//                     } else {
//                         console.log(updateData);
//                         await RecordedCourseVideo.create({
//                             lession_number: lesson[i],
//                             course_id: course._id,
//                             ...updateData
//                         });
//                     }
//                 }
//             req.flash("success", "Course Updated Successfully");
//             res.redirect("/course/recorded-course");
//     }catch(error){
//         req.flash("error", "Something went wrong");
//         res.send(error.message);
//     }
// }

// exports.viewReordedCourse = async (req, res) => {
//     try{
//         const id = req.params.id;
//         const course = await Course.findById(id);
//         const videos = await RecordedCourseVideo.find({
//             course_id : id
//         });  
//         res.render("backend/course/recorded/view", {
//             course, videos
//         });
//     }catch(error){
//         req.flash("errro", "Something went wrong");
//         res.redirect("")
//     }
// }

// exports.recordedCourseTest = async (req, res) => {
//     try{
//         res.render("backend/course/recorded/exam/edit")
//     }catch(error){
//         req.flash("error", "Something went wrong");
//         res.redirect('')
//     }
// }