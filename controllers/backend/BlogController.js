const Blog = require("../../models/Blog");
const fs = require("fs");
const path = require("path");


exports.index = async (req, res) => {
    try{
        const blogs = await Blog.find().sort({created_at: -1});
        res.render('backend/blog/index', {
            blogs
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/blogs');
    }
}

exports.create = async (req, res) => {
    try{
        res.render("backend/blog/create");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/blogs');
    }
}

exports.store = async (req, res) => {
    try{
        const {
            title,
            thumbnail,
            description,
            meta_title,
            meta_keyword,
            meta_description
        } = req.body;

        let thumbnail_image = null;
        if(req.file){
            thumbnail_image = "/uploads/blogs/"+req.file.filename;
        }   
            await Blog.create({
                title,
                description,
                meta_title,
                meta_keyword,
                meta_description,
                thumbnail: thumbnail_image
            });
        req.flash("success", "Blog Added Successfully");
        res.redirect('/blogs');
    }catch(errior){
        req.flash("error", "Something went wrong");
        res.redirect("/blog/create");
    }
}

exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        res.render("backend/blog/edit", {
            blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


exports.update = async (req, res) => {
    try {
        const {
            blog_id,
            title,
            description,
            meta_title,
            meta_keyword,
            meta_description
        } = req.body; 
        const blog = await Blog.findById(blog_id);
        if (!blog) {
            req.flash("error", "Blog not found");
            return res.redirect("/blogs");
        }
        let thumbnail_image = blog.thumbnail;
        if (req.file) {
            if (blog.thumbnail) {
                const oldPath = path.join(__dirname, "..", blog.thumbnail);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            thumbnail_image = "/uploads/blogs/" + req.file.filename;
        }
        blog.title = title;
        blog.description = description;
        blog.meta_title = meta_title;
        blog.meta_keyword = meta_keyword;
        blog.meta_description = meta_description;
        blog.thumbnail = thumbnail_image;
        await blog.save();
        req.flash("success", "Blog Updated Successfully");
        res.redirect("/blogs");
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/blog/edit/" + req.body.blog_id);
    }
};

exports.view = async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        res.render("backend/blog/view", {
            blog
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
            res.redirect("/blogs");
        }   
         await Blog.findByIdAndDelete(id);
        req.flash("success", "Blog has been deleted successfully");
        res.redirect("/blogs");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/blogs");
    }
}