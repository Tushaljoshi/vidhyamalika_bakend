const Subject = require("../../models/Subject");
const MainCategory = require("../../models/MainCategory");
const SubCategory = require("../../models/SubCategory");
const slugify = require("slugify");

// GET ALL SUBJECTS
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

{/*}/ CREATE SUBJECT
exports.createSubject = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
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

    while (await Subject.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Image
    let image_path = req.file
      ? `/uploads/subjects/${req.file.filename}`
      : "/assets/images/default-placeholder.png";

    const subject = await Subject.create({
      name,
      image: image_path,
      slug,
      status: status === "active",
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE SUBJECT
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Slug update
    let slug = subject.slug;

    if (name !== subject.name) {
      const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      slug = baseSlug;
      let counter = 1;

      while (
        await Subject.findOne({
          slug,
          _id: { $ne: id },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    // Image update
    let image_path = subject.image;
    if (req.file) {
      image_path = `/uploads/subjects/${req.file.filename}`;
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        image: image_path,
        status: status === "active",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE SUBJECT
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check dependencies
    const existsInMain = await MainCategory.findOne({ subject_id: id });
    const existsInSub = await SubCategory.findOne({ subject_id: id });

    if (existsInMain || existsInSub) {
      return res.status(400).json({
        success: false,
        message: "Subject is used in categories. Cannot delete.",
      });
    }

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};*/}