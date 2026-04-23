const Subject = require("../../models/Subject");
const MainCategory = require("../../models/MainCategory");
const SubCategory = require("../../models/SubCategory");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

exports.index = async (req, res) => {
    try{
        const subjects = await Subject.find(); 
        const sub_categories = await SubCategory.find().populate("main_category_id").populate("subject_id").sort({created_at: -1});
        res.render("backend/sub_category/index", {
            subjects, 
            sub_categories
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/sub-categories");
    }
}

exports.getMainCategoryList = async (req, res) => {
    try{
        const { id } = req.params; 
        const main_categories = await MainCategory.find({
            subject_id: id
        });
        res.json({
            success: true,
            data: main_categories
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.json({
            success: false, 
        });
    }
};

exports.store = async (req, res) => {
    try{
        const { name, subject, main_category, status } = req.body; 

        let slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true
        }); 
        let existingSlug = await SubCategory.findOne({ slug });
        let counter = 1;
        while (existingSlug) {
            slug = `${slug}-${counter}`;
            existingSlug = await SubCategory.findOne({ slug });
            counter++;
        }

        let image_path = null;
        if(req.file){
            image_path = "/uploads/sub_category/" + req.file.filename;
        }else{
            image_path = "/assets/images/default-placeholder.png"
        }

        const sub_category = new SubCategory({
            name,   
            subject_id: subject,
            main_category_id: main_category,
            image: image_path,
            slug: slug, 
            status: status == "active" ? true : false
        });
        await sub_category.save();
        res.redirect("/sub-categories");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.send(error.message);
    }
}

exports.update = async (req, res) => {
    try{
        const { category_id, edit_name, edit_subject, edit_main_category, edit_status } = req.body;
        const sub_category = await SubCategory.findById(category_id);

        // Generate slug ONLY if name changed
                let slug = sub_category.slug; 
                if (edit_name !== sub_category.name) {
                    const baseSlug = slugify(edit_name, {
                        lower: true,
                        strict: true,
                        trim: true
                    }); 
                    slug = baseSlug;
                    let counter = 1; 
                    while (
                        await SubCategory.findOne({
                            slug,
                            _id: { $ne: category_id } // exclude current doc
                        })
                    ) {
                        slug = `${baseSlug}-${counter}`;
                        counter++;
                    }
                }
        
        let image_path = sub_category.image;
        // if new image uploaded
        if(req.file){
            image_path = "/uploads/sub_category/" + req.file.filename;
            //delete old image from server
            // if(sub_category.image){
            //     const oldImage = path.join(
            //         __dirname,
            //         "..",
            //         "public",
            //         "sub_category.image"
            //     );
            //     if(fs.existsSync(oldImage)){
            //         fs.unlinkSync(oldImage);
            //     }
            // }
        }

        await SubCategory.findByIdAndUpdate(
            category_id,
            {
                name: edit_name,
                subject_id: edit_subject,
                main_category_id: edit_main_category,
                image: image_path,
                slug,
                status: edit_status == "active" ? true : false
            });
            req.flash("success", "Category updated successully");
            res.redirect("/sub-categories");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/sub-categories');
        
    }
}

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/sub-categories");
        }
        
        await SubCategory.findByIdAndDelete(id);
        req.flash("success", "Category deleted successfully");
        res.redirect("/sub-categories");
    }catch(error){  
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/sub-categories");
    }
}