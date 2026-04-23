const SiteSetting = require("../../models/SiteSetting");
const path = require("path");
const fs = require("fs");

exports.edit = async (req, res) => {
    try {
        const site_detail = await SiteSetting.findOne(); 
        if (!site_detail) {
            return res.status(404).send("Site Detail not found");
        }
        res.render("backend/site_setting/edit", {
            site_detail
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}

exports.update = async (req, res) => {
    try {
        const { 
            site_name,
            website,
            phone_primary,
            phone_secondary,
            email_primary,
            email_secondary,
            footer_text,
            address,
            disclaimer,
            meta_title,
            meta_keyword,
            meta_description
        } = req.body;

        const site_setting = await SiteSetting.findOne();

        if (!site_setting) {
            req.flash("error", "Site Setting not found");
            return res.redirect("/site-setting");
        }

        let logo = site_setting.logo;
        let favicon = site_setting.favicon;

        // ✅ Handle LOGO upload
        if (req.files && req.files.logo) {
            // delete old
            if (site_setting.logo) {
                const oldPath = path.join("public", site_setting.logo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            logo = "/uploads/settings/" + req.files.logo[0].filename;
        }

        // ✅ Handle FAVICON upload
        if (req.files && req.files.favicon) {
            // delete old
            if (site_setting.favicon) {
                const oldPath = path.join("public", site_setting.favicon);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            favicon = "/uploads/settings/" + req.files.favicon[0].filename;
        }

        await SiteSetting.findByIdAndUpdate(site_setting._id, {
            site_name,
            website,
            phone_primary,
            phone_secondary,
            email_primary,
            email_secondary,
            footer_text,
            address,
            disclaimer,
            meta_title,
            meta_keyword,
            meta_description,
            logo,
            favicon
        });

        req.flash("success", "Setting updated successfully");
        res.redirect("/site-setting");

    } catch (error) {
        console.error(error);
        req.flash("error", error.message || "Something went wrong");
        res.redirect("/site-setting");
    }
};