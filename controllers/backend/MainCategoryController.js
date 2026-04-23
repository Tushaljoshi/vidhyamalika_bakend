const MainCategory = require("../../models/MainCategory");
const Subject = require("../../models/Subject");
const SubCategory = require("../../models/SubCategory");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.index = async (req, res) => {
    try{
        const subjects = await Subject.find();
        const main_categories = await MainCategory.find().populate("subject_id").sort({create_at: -1});
        res.render('backend/main_category/index', {
            subjects,
            main_categories
        });
    }catch(error){
        console.error(error);
        req.flash("error", "Something went wrong");
        return res.redirect('/main-categories');
    }
}

exports.store = async (req, res) => {
    try{
        const { name, subject, status } = req.body;
        if(!name || name.trim() === ""){
            req.flash("error", "Name is required");
            res.redirect("/main-categories");
        }
        if(!subject || subject === ""){
            req.flash("error", "Subject is required");
            res.redirect("/main-categories");
        }
        if(!status || !["active", "inactive"].includes(status)){
            req.flash("error", "Status is required");
            res.redirect("/main-categories");
        }
        
        let slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true
        }); 
        let existingSlug = await MainCategory.findOne({ slug });
        let counter = 1;
        while (existingSlug) {
            slug = `${slug}-${counter}`;
            existingSlug = await MainCategory.findOne({ slug });
            counter++;
        }
        
         let image_path = null;
          if(req.file){
            image_path = "/uploads/main_category/" + req.file.filename;
        }else{
            image_path = "/assets/images/default-placeholder.png"
        }
        const main_category = new MainCategory({
                name,
                subject_id: subject,
                image: image_path,
                slug: slug, 
                status: status == "active" ? true : false
        });
        await main_category.save();
        req.flash("success", "Main Category created successfully");
        res.redirect("/main-categories");
    }catch(error){
        console.error(error);
        req.flash("error", "Something went wrong");
        res.send(error.message);
    }
}

exports.update = async (req, res) => {
    try{
        const { category_id, edit_subject, edit_category_name, edit_category_status } = req.body;
        if(!category_id){
            req.flash("error", "Category id is required");
            res.redirect("/main-categories");
        }
        if(!edit_category_name || edit_category_name.trim() === ""){
            req.flash("error", "Category name is required");
            res.redirect("/main-categories");
        }
        if(!edit_subject || edit_subject.trim() === ""){
            req.flash("error", "Subject is required");
            res.redirect("/main-categories");
        }
        if(!edit_category_status || !["active", "inactive"].includes(edit_category_status)){
            req.flash("error", "Status is required");
            res.redirect("/main-categories");
        }
        const main_category = await MainCategory.findById(category_id);
        if(!main_category){
            req.flash("error", "Category not found");
            res.redirect("/main-categories");
        }

        // ✅ Generate slug ONLY if name changed
        let slug = main_category.slug; 
        if (edit_category_name !== main_category.name) {
            const baseSlug = slugify(edit_category_name, {
                lower: true,
                strict: true,
                trim: true
            }); 
            slug = baseSlug;
            let counter = 1; 
            while (
                await MainCategory.findOne({
                    slug,
                    _id: { $ne: category_id } // 🔥 exclude current doc
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

         let image_path = main_category.image;
                // if new image uploaded
                if(req.file){
                    image_path = "/uploads/main_category/" + req.file.filename;
                    //delete old image from server
                    // if(main_category.image){
                    //     const oldImage = path.join(
                    //         __dirname,
                    //         "..",
                    //         "public",
                    //         "main_category.image"
                    //     );
                    //     if(fs.existsSync(oldImage)){
                    //         fs.unlinkSync(oldImage);
                    //     }
                    // }
                }
                
        await MainCategory.findByIdAndUpdate(
            category_id,
            {
                name:edit_category_name,
                subject_id: edit_subject,
                image: image_path,
                 slug,
                status: edit_category_status === "active" ? true : false
            });
            req.flash("success", "Category updated successfully");
            res.redirect("/main-categories");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/main-categories");
    }
}

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/main-categories");
        }   
        const existsInMain = await SubCategory.findOne({
            main_category_id: id
        });
        if (existsInMain) {
            req.flash("error", "Main Category is already used in sub category. Cannot delete.");
            return res.redirect("/main-categories");
        }
         await MainCategory.findByIdAndDelete(id);
        req.flash("success", "Category has been deleted successfully");
        res.redirect("/main-categories");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/main-categories");
    }
}
