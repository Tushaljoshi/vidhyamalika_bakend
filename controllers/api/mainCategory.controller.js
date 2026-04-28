const MainCategory = require("../../models/MainCategory");
const Subject = require("../../models/Subject");

// GET ALL MAIN CATEGORIES
exports.getMainCategories = async (req, res) => {
  try {
    const main_categories = await MainCategory.find()
      .populate("subject_id") // include subject details
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: main_categories.length,
      data: main_categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MAIN CATEGORY BY ID
exports.getMainCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MainCategory.findById(id).populate("subject_id");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Main category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};