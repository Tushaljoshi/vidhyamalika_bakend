const SocialMediaLink = require("../../models/SocialMediaLink");
const validator = require("validator");
const mongoose = require("mongoose");

exports.index = async (req, res) => {
    try{
        const links = await SocialMediaLink.find();
        res.render("backend/social_media_links", {
            links
        });
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/social-media-links");
    }
}
exports.store = async (req, res) => {
    try {
        let { title, icon, url, status } = req.body;
        title = title?.trim();
        icon = icon?.trim();
        url = url?.trim();
        const errors = [];
        if (!title) {
            errors.push("Title is required");
        } else if (title.length < 2 || title.length > 50) {
            errors.push("Title must be between 2 and 50 characters");
        }
        if (!icon) {
            errors.push("Icon is required");
        }
        if (!url) {
            errors.push("URL is required");
        } else if (!validator.isURL(url, { require_protocol: true })) {
            errors.push("Invalid URL (must include http/https)");
        }
        if (status && !["active", "inactive"].includes(status)) {
            errors.push("Invalid status value");
        }
        if (errors.length > 0) {
            req.flash("error", errors.join(", "));
            return res.redirect("/social-media-links");
        }
        const statusBoolean = status === "active";
        await SocialMediaLink.create({
            title,
            icon,
            url,
            status: statusBoolean
        });
        req.flash("success", "Social media link created successfully");
        return res.redirect("/social-media-links");
    } catch (error) {
        req.flash("error", "Internal server error");
        return res.redirect("/social-media-links");
    }
};

exports.update = async (req, res) => {
    try {
        let { link_id, title, icon, url, edit_link_status } = req.body;
        title = title?.trim();
        icon = icon?.trim();
        url = url?.trim();
        const errors = [];
        if (!link_id || !mongoose.Types.ObjectId.isValid(link_id)) {
            errors.push("Invalid link ID");
        }
        if (!title) {
            errors.push("Title is required");
        } else if (title.length < 2 || title.length > 50) {
            errors.push("Title must be between 2 and 50 characters");
        }
        if (!icon) {
            errors.push("Icon is required");
        }
        if (!url) {
            errors.push("URL is required");
        } else if (!validator.isURL(url, { require_protocol: true })) {
            errors.push("Invalid URL (must include http/https)");
        }
        if (edit_link_status && !["active", "inactive"].includes(edit_link_status)) {
            errors.push("Invalid status value");
        }
        if (errors.length > 0) {
            req.flash("error", errors.join(", "));
            return res.redirect("/social-media-links");
        }
        const existing = await SocialMediaLink.findById(link_id);
        if (!existing) {
            req.flash("error", "Social media link not found");
            return res.redirect("/social-media-links");
        }
        const statusBoolean = edit_link_status === "active";
        await SocialMediaLink.findByIdAndUpdate(
            link_id,
            {
                title,
                icon,
                url,
                status: statusBoolean
            },
            { new: true, runValidators: true }
        );
        req.flash("success", "Social media link updated successfully");
        return res.redirect("/social-media-links");
    } catch (error) {
        req.flash("error", "Internal server error");
        return res.redirect("/social-media-links");
    }
};