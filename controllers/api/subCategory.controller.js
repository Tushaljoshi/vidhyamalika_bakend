const SubCategory = require("../../models/SubCategory");
const MainCategory = require("../../models/MainCategory");
const Subject = require("../../models/Subject");
const slugify = require("slugify");

// ✅ GET ALL SUB CATEGORIES
exports.getSubCategories = async (req, res) => {
  try {
    const data = await SubCategory.find()
      .populate({
        path: "subject_id",
        select: "name slug image status", // ✅ clean subject fields
      })
      .populate({
        path: "main_category_id",
        select: "name slug image status subject_id", // ✅ full main category
        populate: {
          path: "subject_id", // 🔥 nested populate (same as subject)
          select: "name slug",
        },
      })
      .populate({
        path: "teacher_id",
        select: "name email", // optional
      })
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET BY ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await SubCategory.findById(id)
      .populate("subject_id")
      .populate("main_category_id")
      .populate("teacher_id"); // ✅ NEW

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE
exports.createSubCategory = async (req, res) => {
  try {
    const { name, subject, main_category, status, teacher_id } = req.body;

    // Validation
    if (!name || !subject || !main_category || !teacher_id) {
      return res.status(400).json({
        success: false,
        message: "Name, subject, main_category and teacher_id are required",
      });
    }

    // Slug
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await SubCategory.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Image
    const image_path = req.file
      ? `/uploads/sub_category/${req.file.filename}`
      : "/assets/images/default-placeholder.png";

    const subCategory = await SubCategory.create({
      name,
      subject_id: subject,
      main_category_id: main_category,
      teacher_id, // ✅ NEW
      image: image_path,
      slug,
      status: status === "active",
    });

    return res.status(201).json({
      success: true,
      message: "Sub category created successfully",
      data: subCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, main_category, status, teacher_id } = req.body;

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    // Slug update
    let slug = subCategory.slug;

    if (name && name !== subCategory.name) {
      const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      slug = baseSlug;
      let counter = 1;

      while (
        await SubCategory.findOne({
          slug,
          _id: { $ne: id },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    // Image update
    let image_path = subCategory.image;
    if (req.file) {
      image_path = `/uploads/sub_category/${req.file.filename}`;
    }

    const updated = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        subject_id: subject,
        main_category_id: main_category,
        teacher_id, // ✅ NEW
        image: image_path,
        slug,
        status: status === "active",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Sub category updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};