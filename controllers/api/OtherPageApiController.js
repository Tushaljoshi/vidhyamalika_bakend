const OtherPage = require("../../models/OtherPage");

exports.getAllOtherPages = async (req, res) => {
    try {
        const pages = await OtherPage.find()
            .sort({ createdAt: -1 })
            .select("name slug status createdAt");

        return res.status(200).json({
            status: true,
            total: pages.length,
            data: pages
        });

    } catch (error) {
        console.error("getAllOtherPages error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.getOtherPageBySlug = async (req, res) => {
    try {
        const { slug } = req.query;

        // 1. Validate slug
        if (!slug) {
            return res.status(400).json({
                status: false,
                message: "Slug is required"
            });
        }

        // 2. Find active page
        const page = await OtherPage.findOne({
            slug: slug.toLowerCase().trim(),
            status: true
        }).select("-__v");

        if (!page) {
            return res.status(404).json({
                status: false,
                message: "Page not found"
            });
        }

        return res.status(200).json({
            status: true,
            data: page
        });

    } catch (error) {
        console.error("getOtherPageBySlug error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};