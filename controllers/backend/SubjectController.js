const Subject = require('../../models/Subject');
const MainCategory = require('../../models/MainCategory');
const SubCategory = require('../../models/SubCategory');
const slugify = require("slugify");

exports.index = async (req, res) => {
    try{
        const subjects = await Subject.find().sort({created_at: -1});
        res.render('backend/subject/index', {
            subjects
        });
    }catch(error){
        console.error(error)
        req.flash("error", "Something went wrong");
        res.redirect("/subject");
    }
};

exports.store = async (req, res) => {
    try{
        const { name, status } = req.body;
        if(!name || name.trim() === ""){
            req.flash("error", "Name is required");
             return res.redirect("/subject");
        }
        if(!status || !["active", "inactive"].includes(status)){
            req.flash("error", "Status is Required");
             return res.redirect("/subject");
        } 


        let slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true
        }); 
        let existingSlug = await Subject.findOne({ slug });
        let counter = 1;
        while (existingSlug) {
            slug = `${slug}-${counter}`;
            existingSlug = await Subject.findOne({ slug });
            counter++;
        }

        let image_path = null;
        if(req.file){
            image_path = "/uploads/subjects/" + req.file.filename;
        }else{
            image_path = "/assets/images/default-placeholder.png"
        }
        const subject = new Subject({
            name: name,
            image: image_path,
            slug: slug, 
            status: status == "active" ? true : false
        });
        await subject.save();
        req.flash("success", "Subject Created Successfully");
        res.redirect("/subject");
    }catch(error){
        console.error(error.message)
        req.flash("error", "Something went wrong");
        res.redirect("/subject");
    }
};

exports.update = async (req, res) => {
    try{
        const { subject_id, name, status } = req.body;

        if(!name || name.trim() === "" ){
            req.flash("error", "Name is required");
            return res.redirect("/subject");
        }
        if(!status || !["active", "inactive"].includes(status)){
            req.flash("error", "Status is required");
            return res.redirect("/subject");
        }

        const subject = await Subject.findById(subject_id);
        if(!subject){
            req.flash("error", "Subject not found");
            return res.redirect('/subject');
        }

         // ✅ Generate slug ONLY if name changed
        let slug = subject.slug; 
        if (name !== subject.name) {
            const baseSlug = slugify(name, {
                lower: true,
                strict: true,
                trim: true
            }); 
            slug = baseSlug;
            let counter = 1; 
            while (
                await Subject.findOne({
                    slug,
                    _id: { $ne: subject_id } // 🔥 exclude current doc
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }


        let image_path = subject.image;
        // if new image uploaded
        if(req.file){
            image_path = "/uploads/subjects/" + req.file.filename;
            //delete old image from server
            // if(subject.image){
            //     const oldImage = path.join(
            //         __dirname,
            //         "..",
            //         "public",
            //         "subject.image"
            //     );
            //     if(fs.existsSync(oldImagePath)){
            //         fs.unlinkSync(oldImagePath);
            //     }
            // }
        }

        await Subject.findByIdAndUpdate(
            subject_id,
            {   
                name,
                image: image_path,
                slug,
                status: status === "active" ? true : false
            },
            {new: true, runValidators:true }
        );
        req.flash("success", "Subject updated successfully");
        res.redirect("/subject");
    }catch(error){
        console.error(error)
        req.flash("error", "Something went wrong");
        // res.redirect("/subject");
        res.send(error.message);
    }
}

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/subject");
        }   
        const existsInMain = await MainCategory.findOne({
            subject_id: id
        });
        const existsInSub = await SubCategory.findOne({
            subject_id: id
        });
        if (existsInMain || existsInSub) {
            req.flash("error", "Subject is already used in category. Cannot delete.");
            return res.redirect("/subject");
        }

        await Subject.findByIdAndDelete(id);
        req.flash("success", "Subject deleted successfully");
        res.redirect("/subject");
    }catch(error){  
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/subject");
    }
}