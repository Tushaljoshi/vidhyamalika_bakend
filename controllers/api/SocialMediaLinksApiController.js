const SocialMediaLink = require("../../models/SocialMediaLink");

exports.index = async (req, res) => {
    try {
        const links = await SocialMediaLink.find({ status: true }).lean();
        if (!links || links.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No social media links found",
                data: []
            });
        }
        return res.status(200).json({
            status: true,
            count: links.length,
            data: links
        });
    } catch (error) {
        console.error("SocialMediaLink Index Error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};