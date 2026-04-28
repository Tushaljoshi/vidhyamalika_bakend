const Course = require("../../models/Course");
const slugify = require("slugify");

// GET ALL COURSES
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ type: "online" })
      .populate("subject_id")
      .populate("main_category_id")
      .populate("sub_category_id")
      .populate("teacher_id") 
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET COURSE BY ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("subject_id")
      .populate("main_category_id")
      .populate("sub_category_id")
      .populate("teacher_id");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE COURSE
exports.createCourse = async (req, res) => {
  try {
    const {
      course_name,
      short_description,
      full_description,
      curriculum,
      subject,
      main_category,
      sub_category,
      language,
      certificate,
      no_of_lesson,
      price,
      sale_price,
      teacher_id, // ✅ NEW FIELD
    } = req.body;

    // Validation
    if (
      !course_name ||
      !subject ||
      !main_category ||
      !sub_category ||
      !teacher_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Slug
    const baseSlug = slugify(course_name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
      await Course.findOne({
        slug,
        type: "online",
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Image
    const image_path = req.file
      ? `/uploads/online_course/${req.file.filename}`
      : "/assets/images/default-placeholder.png";

    const course = await Course.create({
      name: course_name,
      short_description,
      full_description,
      curriculum,
      slug,
      subject_id: subject,
      main_category_id: main_category,
      sub_category_id: sub_category,
      teacher_id, // ✅ SAVE
      type: "online",
      language,
      certificate,
      total_no_of_lesson: no_of_lesson,
      price,
      sale_price,
      thumbnail: image_path,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const body = req.body || {}; // ✅ safe fallback

    const {
      course_name,
      short_description,
      full_description,
      curriculum,
      subject,
      main_category,
      sub_category,
      language,
      certificate,
      no_of_lesson,
      price,
      sale_price,
      teacher_id,
    } = body; // ✅ FIXED HERE

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ✅ Slug update
    let slug = course.slug;

    if (course_name && course_name !== course.name) {
      const baseSlug = slugify(course_name, {
        lower: true,
        strict: true,
        trim: true,
      });

      slug = baseSlug;
      let counter = 1;

      while (
        await Course.findOne({
          slug,
          type: "online",
          _id: { $ne: id },
        })
      ) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    // ✅ Image update
    let image_path = course.thumbnail;
    if (req.file) {
      image_path = `/uploads/online_course/${req.file.filename}`;
    }

    // ✅ Dynamic update
    const updateData = {
      slug,
      thumbnail: image_path,
    };

    if (course_name) updateData.name = course_name;
    if (short_description) updateData.short_description = short_description;
    if (full_description) updateData.full_description = full_description;
    if (curriculum) updateData.curriculum = curriculum;
    if (subject) updateData.subject_id = subject;
    if (main_category) updateData.main_category_id = main_category;
    if (sub_category) updateData.sub_category_id = sub_category;
    if (teacher_id) updateData.teacher_id = teacher_id;
    if (language) updateData.language = language;
    if (certificate) updateData.certificate = certificate;
    if (no_of_lesson) updateData.total_no_of_lesson = no_of_lesson;
    if (price) updateData.price = price;
    if (sale_price) updateData.sale_price = sale_price;

    const updated = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error); // ✅ always log
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// DELETE COURSE
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};