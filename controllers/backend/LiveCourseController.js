const Course = require("../../models/Course");
const Subject = require("../../models/Subject");
const MainCategory = require("../../models/MainCategory");
const SubCategory = require("../../models/SubCategory");
const slugify = require("slugify");

exports.index = async (req, res) => {
    try{
        const courses = await Course.find({type: "online"}).populate("subject_id").populate("main_category_id").populate("sub_category_id").sort({create_at: -1});
        res.render('backend/course/livecourse/index', {
            courses
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('backend/live-course/index');
    }
};

exports.create = async (req, res) => {
    try{
        const subjects = await Subject.find({ status:true });
        res.render("backend/course/livecourse/create", { subjects });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("course/live-course");
    }
}

exports.store = async (req, res) => {
    try{
        const { 
            course_name,
            short_description,
            full_description,
            curriculum,
            subject,
            main_category,
            sub_category,
            language,
            certificate,
            no_of_lesson,
            price,
            sale_price, 
            thumbnail,
         } = req.body;

         if(!course_name || !subject || !main_category || !sub_category || !language || !certificate || !no_of_lesson || !price || !sale_price){
            req.flash("error", "All fields are required");
            res.redirect("/course/live-course");
         }
        let image_path = null;
          if(req.file){
            image_path = "/uploads/online_course/" + req.file.filename;
        }else{
            image_path = "/assets/images/default-placeholder.png"
        }

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
                type: 'online'
            })
        ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        

        const course = await Course.create({
            name: course_name,
            short_description,
            full_description,
            curriculum,
            slug,
            subject_id: subject,
            main_category_id: main_category,
            sub_category_id: sub_category,
            type: 'online', 
            language,
            certificate,
            total_no_of_lesson: no_of_lesson,
            price,
            sale_price,
            thumbnail: image_path   
        });
        req.flash("success", "Course added successfully");
        res.redirect("/course/live-course");
    
    }catch(error){
        console.error(error.message);
        req.flash("error", "Something went wrong");
        res.redirect("/course/live-course");
    }
}

exports.edit = async (req, res) => {
    try{
        const id = req.params.id;
        const course = await Course.findById(id);
        const subjects = await Subject.find({ status:true });
        const main_categories = await MainCategory.find({ status: true, subject_id: course.subject_id });
        const sub_categories = await SubCategory.find({ status: true, main_category_id: course.main_category_id });
         
        res.render("backend/course/livecourse/edit", {
            course, subjects, main_categories, sub_categories
        });
    }catch(error){
        console.error(error.message);
        req.flash("error", "Something went wrong");
        res.redirect("/course/live-course");
    } 
}

    exports.update = async (req, res) => {
        try{
            const {
                course_id,
                course_name,
                short_description,
                full_description,
                curriculum,
                subject,
                main_category,
                sub_category,
                language,
                certificate,
                no_of_lesson,
                price,
                sale_price, 
            } = req.body;
            const type = 'online';  
            let course = await Course.findById(course_id);
            let image_path = course.thumbnail;
                // if new image uploaded
                if(req.file){
                image_path = "/uploads/online_course/" + req.file.filename;
                }
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
                        curriculum,
                        slug,
                        subject_id: subject,
                        main_category_id: main_category,
                        sub_category_id: sub_category, 
                        language,
                        certificate,
                        total_no_of_lesson: no_of_lesson,
                        price,
                        sale_price,
                        thumbnail: image_path  
                    }
                ); 
                req.flash("success", "Course Updated Successfully");
                res.redirect("/course/live-course");
        }catch(error){
            req.flash("error", "Something went wrong");
            res.redirect("/course/live-course");
        }
    }

    exports.view = async (req, res) => {
        try{
            const id = req.params.id;
            const course = await Course.findById(id).populate('subject_id').populate("main_category_id").populate("sub_category_id");
            res.render("backend/course/livecourse/view", {
                course
            });
        }catch(error){
            req.flash("errro", "Something went wrong");
            res.redirect("")
        }
    }

    exports.destroy = async (req, res) => {
        try{
            const { id } = req.params;
            if(!id){
                req.flash("error", "Invalid Request");
                res.redirect("/course/live-course");
            } 
            await Course.findByIdAndDelete(id);
            req.flash("success", "Course deleted successfully");
            res.redirect("/course/live-course");
        }catch(error){  
            console.error(error);
            req.flash("error", "Something went wrong");
            res.redirect("/course/live-course");
        }
    }