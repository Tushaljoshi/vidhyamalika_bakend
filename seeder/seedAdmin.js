const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    const email = "admin@gmail.com";
    const password = "123456";

    //check if already exists
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log("ℹAdmin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name: "Admin",
      email,
      password: hashedPassword
    });

    console.log("Default Admin Created");
    console.log("Email:", email);
    console.log("Password:", password);

  } catch (error) {
    console.error("Error creating admin:", error.message);
  }
};

module.exports = createDefaultAdmin;