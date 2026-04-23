require("dotenv").config();
const mongoose = require("mongoose");
const SiteSetting = require("../models/SiteSetting");

mongoose.connect(process.env.MONGO_URI);

async function seed() {
    const exists = await SiteSetting.findOne();
    if (!exists) {
        await SiteSetting.create({
            site_name: "My Website",
            logo: "/uploads/default-logo.png",
            favicon: "/uploads/favicon.ico",
            meta_title: "Default Meta Title",
            meta_keyword: "default, keywords",
            meta_description: "Default description",
            phone_primary: "9999999999",
            email_primary: "admin@example.com",
            website: "https://example.com",
            footer_text: "© 2026 My Website",
            address: "India"
        });
        console.log("✅ Default Site Setting Created");
    } else {
        console.log("⚠️ Already exists");
    }
    mongoose.disconnect();
}
seed();