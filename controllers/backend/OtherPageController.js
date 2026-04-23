const OtherPage = require("../../models/OtherPage");
const fs = require("fs");
const path = require("path");

exports.index = async (req, res) => {
    try{
        const other_pages = await OtherPage.find().sort({createdAt: -1});
        
        res.render('backend/other_page/index', {
            other_pages
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/other-page');
    }
}

exports.create = async (req, res) => {
    try{
        res.render("backend/other_page/create");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/other-page');
    }
}
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
        .replace(/\s+/g, "-")           // space → hyphen
        .replace(/-+/g, "-");           // remove duplicate hyphens
};

const createUniqueSlug = async (name) => {
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let count = 1;

    while (await OtherPage.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    return slug;
};

exports.store = async (req, res) => {
    try {
        const { name, content, meta_title, meta_keyword, meta_description, status } = req.body;
        if (!name) {
            req.flash("error", "Name is required");
            return res.redirect("/other-page");
        }
        // ✅ Generate unique slug
        const slug = await createUniqueSlug(name);
        await OtherPage.create({
            name,
            slug,
            content,
            meta_title,
            meta_keyword,
            meta_description,
            status: status === "active" ? true : false
        });
        req.flash("success", "Page Added Successfully");
        res.redirect('/other-page');
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/other-page");
    }
};

exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const other_page = await OtherPage.findById(id);
        if (!other_page) {
            return res.status(404).send("Page not found");
        }
        res.render("backend/other_page/edit", {
            other_page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

exports.update = async (req, res) => {
    try {
        const {
            page_id,
            name,
            content,
            meta_title,
            meta_keyword,
            meta_description,
            status
        } = req.body;

        const other_page = await OtherPage.findById(page_id);

        if (!other_page) {
            req.flash("error", "Page not found");
            return res.redirect("/other-page");
        }

        // ✅ Only update slug if name is changed
        if (name && name !== other_page.name) {

            let slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");

            // ✅ Ensure unique slug
            let baseSlug = slug;
            let counter = 1;

            while (await OtherPage.findOne({ slug, _id: { $ne: page_id } })) {
                slug = `${baseSlug}-${counter++}`;
            }

            other_page.slug = slug;
        }

        // बाकी fields update
        other_page.name = name;
        other_page.content = content;
        other_page.meta_title = meta_title;
        other_page.meta_keyword = meta_keyword;
        other_page.meta_description = meta_description;
        other_page.status = status === "active" ? true : false;

        await other_page.save();

        req.flash("success", "Page Updated Successfully");
        res.redirect("/other-page");

    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/other-page/edit/" + req.body.page_id);
    }
};

exports.view = async (req, res) => {
    try {
        const id = req.params.id;
        const other_page = await OtherPage.findById(id);
        if (!other_page) {
            return res.status(404).send("Page not found");
        }
        res.render("backend/other_page/view", {
            other_page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/other-page");
        }   
         await OtherPage.findByIdAndDelete(id);
        req.flash("success", "Page has been deleted successfully");
        res.redirect("/other-page");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/other-page");
    }
}