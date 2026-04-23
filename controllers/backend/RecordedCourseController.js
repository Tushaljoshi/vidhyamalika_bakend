const RecordedCourseVideo = require("../../models/RecordedCourseVideo");
const Course = require("../../models/Course");
const fs = require("fs");
const path = require("path");
const RecordedCourseTest = require("../../models/RecordedCourseTest");
const RecordedCourseTestQue = require("../../models/RecordedCourseTestQue");
const MainCategory = require("../../models/MainCategory");
const Subject = require("../../models/Subject")
const SubCategory = require("../../models/SubCategory");
const slugify = require("slugify");


exports.index = async (req, res) => {
    try{
    const courses = await Course.find({type: "recorded"}).populate("subject_id").populate("main_category_id").populate("sub_category_id").sort({createdAt: -1});
       res.render("backend/course/recorded/index", {courses}); 
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/course/recorded-course');
    }
}

exports.create = async (req, res) => {
    try{ 
        const subjects = await Subject.find({ status:true });
        res.render("backend/course/recorded/create", { 
            subjects
        });
    }catch(error){
        console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/course/recorded-course");
    }
}

exports.store = async (req, res) => {
    try{ 
        const {
            course_name,
            short_description,
            full_description,
            subject,
            main_category,
            sub_category,
            duration_hrs,
            duration_min,
            language,
            certificate,
            no_of_lesson,
            price,
            sale_price,
            lesson,
            title,
            video_type,
            video_url
        } = req.body;
        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].filename : "default_course_thumbnail.png";

        const videoFiles = req.files["video_file[]"] || [];
        const baseSlug = slugify(course_name, {
            lower: true,
            strict: true,
            trim: true
        });
        let slug = baseSlug;
        let counter = 1;
        while (
            await Course.findOne({
                slug,
                type: 'recorded'
            })
        ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Save Course
        const course = await Course.create({
            name: course_name,
            short_description,
            full_description,
            subject_id: subject,
            main_category_id: main_category,
            sub_category_id: sub_category,
            type: 'recorded',
            total_hrs: duration_hrs,
            total_min: duration_min,
            language,
            certificate,
            total_no_of_lesson: no_of_lesson,
            price,
            sale_price,
            slug,
            thumbnail: "/uploads/recorded_course/"+thumbnail
        });
        let fileIndex = 0;
            // 2️⃣ Save Lessons
            if (!lesson) {
              
            }  else{
                  for (let i = 0; i < lesson.length; i++) {
                    let videoFile = null;
                    let videoUrl = null;
                    // dynamic radio name
                    let videoType = req.body[`video_type_${i+1}`];
                    if(videoType === "video_url"){
                        videoUrl = video_url[i];
                    }
                    if(videoType === "video_file"){
                        videoFile = videoFiles[fileIndex].filename;
                        fileIndex++;
                    }
                    await RecordedCourseVideo.create({
                        lesson_number: lesson[i],
                        title: title[i],
                        video_type: videoType,
                        video_file: "/uploads/recorded_course/"+videoFile,
                        video_url: videoUrl,
                        course_id: course._id
                    });
                }
            }

        req.flash("success", "Course Added Successfully");
        res.redirect('/course/recorded-course');
    }catch(error){
        console.error(error.message);
        req.flash("error", "Something went wrong");
        res.redirect("/course/recorded-course");
    }
}
    
exports.edit = async (req, res) => {
    try{
        const id = req.params.id;
        const course = await Course.findById(id);
        const subjects = await Subject.find({ status:true });
        const main_categories = await MainCategory.find({ status: true, subject_id: course.subject_id });
        const sub_categories = await SubCategory.find({ status: true, main_category_id: course.main_category_id });
        const videos = await RecordedCourseVideo.find({
            course_id : id
        });  
        // res.send(videos);
        res.render("backend/course/recorded/edit", {
            course, videos, subjects, main_categories, sub_categories
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/course/recorded-course");
    } 
}

exports.update = async (req, res) => {
    try{
        const {
            course_id,
            course_name,
            short_description,
            full_description,
            subject,
            main_category,
            sub_category,
            duration_hrs,
            duration_min,
            language,
            certificate,
            no_of_lesson,
            price,
            sale_price,
            lesson,
            video_type,
            video_url,
            title,
            recorded_video_id
        } = req.body;
        const type = 'recorded';  
        const existingVideos = await RecordedCourseVideo.find({
            course_id : course_id
        });  
        const incomingIds = (recorded_video_id || []).map(id => id.toString());
        const videosToDelete = existingVideos.filter(video => 
            !incomingIds.includes(video._id.toString())
        );
        for (let video of videosToDelete) {
            if (video.video_file) {
                const filePath = path.join(
                    __dirname,
                    "../..",
                    "public",
                    video.video_file
                ); 
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } 
            await RecordedCourseVideo.findByIdAndDelete(video._id);
        }
        let course = await Course.findById(course_id);
        // Slug Logic
        let slug = course.slug;
         if (course_name !== course.name) {
            const baseSlug = slugify(course_name, {
                lower: true,
                strict: true,
                trim: true
            }); 
            slug = baseSlug;
            let counter = 1;
            while (
                await Course.findOne({
                    slug,
                    type,
                    _id: { $ne: course_id } //exclude current doc
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }
            await Course.findByIdAndUpdate(
                course_id,
                {
                    name: course_name,
                    short_description,
                    full_description,
                    slug,
                    subject_id: subject,
                    main_category_id: main_category,
                    sub_category_id: sub_category,
                    total_hrs: duration_hrs,
                    total_min: duration_min,
                    language,
                    certificate,
                    total_no_of_lesson: no_of_lesson,
                    price,
                    sale_price
                }
            ); 
           const thumbnail_file = req.files.find(f => f.fieldname === "thumbnail");
                if(thumbnail_file){ 
                    await Course.findByIdAndUpdate(
                        course_id,
                        {
                            thumbnail: "/uploads/recorded_course/"+thumbnail_file.filename
                        }
                    );
                    const oldImage = path.join(
                        __dirname,
                        "../..",
                        "public",
                        course.thumbnail
                    ); 
                    if(fs.existsSync(oldImage)){
                        fs.unlinkSync(oldImage);
                    } 
                } 
                 if (!lesson) {
              
            }  else{
                for (let i = 0; i < lesson.length; i++) { 
                    let videoFile = null;
                    let videoUrl = null;

                    let videoType = req.body[`video_type_${i+1}`];

                    if (videoType === "video_url") {
                        videoUrl = req.body[`video_url_${i+1}`];
                    } 


                    const existingLesson = recorded_video_id && recorded_video_id[i]
                        ? await RecordedCourseVideo.findById(recorded_video_id[i])
                        : null;

                    let updateData = {
                        video_type: videoType
                    };

                    if (videoType === "video_url") {
                        updateData.video_url = videoUrl;
                        updateData.video_file = null;
                    }
                    const file = req.files.find(f => f.fieldname === `video_file_${i+1}`);
                    if (file) { 
                        videoFile = file.filename;
                        updateData.video_file = "/uploads/recorded_course/" + videoFile;
                        updateData.video_url = null;
                    } 
                    if (existingLesson) {
                        await RecordedCourseVideo.findByIdAndUpdate(
                            existingLesson._id,
                            {
                                lesson_number: lesson[i],
                                title: title[i],
                                ...updateData
                            }
                        );

                    } else { 
                        await RecordedCourseVideo.create({
                            lesson_number: lesson[i],
                            course_id: course._id,
                              title: title[i],
                            ...updateData
                        });
                    }
                }
            }
            req.flash("success", "Course Updated Successfully");
            res.redirect("/course/recorded-course");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.send(error.message);
    }
}

exports.viewReordedCourse = async (req, res) => {
    try{
        const id = req.params.id;
        const course = await Course.findById(id).populate('subject_id').populate("main_category_id").populate("sub_category_id");
        const videos = await RecordedCourseVideo.find({
            course_id : id
        });  
        // res.send(videos);
        res.render("backend/course/recorded/view", {
            course, videos
        });
    }catch(error){
        req.flash("errro", "Something went wrong");
        res.redirect("")
    }
}

exports.updateTestDetail = async (req, res) => {
    try{
        const  { course_id, name, duration } = req.body;
        const course_test = await RecordedCourseTest.findOneAndUpdate(
            { course_id: course_id },
            { $set:{
                name,
                duration
                }
            },
            {
                new: true,
                upsert: true, 
            }
        );
        req.flash("success", "Course detail updated successfully");
        res.redirect("/course/recored-course-test/"+course_id);
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('')
    }
}

exports.recordedCourseTest = async (req, res) => {
    try{
        const  course_id  = req.params.id;
        let questions = ""; 
        const course_test = await RecordedCourseTest.findOne({
            course_id: course_id
        });  
        if(course_test){
             questions = await RecordedCourseTestQue.find({
                course_id: course_id,
                course_test_id: course_test._id
            });
        }
        res.render("backend/course/recorded/exam/edit", {
            course_test,
            course_id,  
            questions,
        }); 
    }catch(error){
        console.error(error);
        req.flash("error", "Something went wrong");
        res.send(error.message);
        // res.redirect('')
    }
}

exports.addRecordedCourseTestQue = async (req, res) => {
    try{
        const { course_id, question, option_a, option_b, option_c, option_d, answer, marks, course_test_id } = req.body; 
        await RecordedCourseTestQue.create({
            course_id,
            course_test_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            answer,
            marks
        }); 
        req.flash("success", "Question added successfully");
        res.redirect("/course/recored-course-test/"+course_id);
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/course/recored-course-test/"+course_id);
    }
}

exports.updateRecordedCourseTestQue = async (req, res) => {
    try{
        const { course_id, question, option_a, option_b, option_c, option_d, answer, marks, course_test_id } = req.body; 
        await RecordedCourseTestQue.findByIdAndUpdate(
            {
                _id: course_test_id
            },{
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            answer,
            marks
        }); 
        req.flash("success", "Question udated successfully");
        res.redirect("/course/recored-course-test/"+course_id);
    }catch(error){
        req.flash("error", "Something went wrong");
        res.send(error.message);
        // res.redirect("/course/recored-course-test/"+course_id);
    }
}

exports.getSubCategoryList = async (req, res) => {
    try{
        const { id } = req.params; 
        const sub_categories = await SubCategory.find({
            main_category_id: id
        });
        res.json({
            success: true,
            data: sub_categories
        });
    }catch(error){
        req.flash("error", "Something went wrong");
         res.json({
            success: false, 
        });
    }
};

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/course/recorded-course");
        } 
        await Course.findByIdAndDelete(id);
        req.flash("success", "Course deleted successfully");
        res.redirect("/course/recorded-course");
    }catch(error){  
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/course/recorded-course");
    }
}