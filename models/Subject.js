const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
   name: String,
   image_path: String,
   image: String,
   slug: {
      type: String,
      unique: true,
      required: true
   },
   status: {
    type: Boolean,
    default: true
   },
   created_at: {
    type: Date,
    default: Date.now
   }
});

SubjectSchema.virtual("sub_menu", {
   ref: "SubCategory",
   localField: "_id",
   foreignField: "subject_id"
});

SubjectSchema.set("toObject", { virtuals: true });
SubjectSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Subject", SubjectSchema);