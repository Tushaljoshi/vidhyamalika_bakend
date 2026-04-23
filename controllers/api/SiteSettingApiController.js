const SiteSetting = require("../../models/SiteSetting");

exports.index = async (req, res) => {
    try {
        const setting = await SiteSetting.findOne().lean();
        if (!setting) {
            return res.status(404).json({
                status: false,
                message: "Site settings not found",
                data: null
            });
        }
        return res.status(200).json({
            status: true,
            data: setting
        });
    } catch (error) {
        console.error("SiteSetting Index Error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong"
        });
    }
};