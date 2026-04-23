const mongoose = require("mongoose");

const SiteSettingSchema = new mongoose.Schema({
    site_name: String,
    logo: String,
    favicon: String,
    meta_title: String,
    meta_keyword: String,
    meta_description: String,
    phone_primary: String,
    phone_secondary: String,
    email_primary: String,
    email_secondary: String,
    website: String,
    footer_text: String,
    disclaimer: String,
    address: String,
    google_map: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SiteSetting", SiteSettingSchema, "site_settings");
