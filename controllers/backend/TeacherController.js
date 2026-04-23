const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { Parser } = require('json2csv');

exports.index = async (req, res) => {
    try{    
        const teachers = await User.find({
            user_role: 1
        }).sort({created_at: -1});
        res.render('backend/teacher/index', {
            teachers
        });
    }catch(error){
        req.flash('error', "Something went wrong");
    }
}


exports.create = async (req, res) => {
    try{
        res.render("backend/teacher/create");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect('/teachers');
    }
}


exports.store = async (req, res) => {
    try{
        const { name, email, phone, experience, gender } = req.body;
        length = 12
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
        let password = '';
         for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        let teacher_photo = null;
        // 1. Check existing user
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });
           if (existingUser) {
            req.flash("error", "Email or Phone already exists");
        } 
       
        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (req.file) {
            teacher_photo = "/uploads/teachers/" + req.file.filename;
        }
        // 3. Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            gender,
            experience,
            photo: teacher_photo,
            user_role: 1,
        });
        req.flash("success", "Teacher Created Successfully");
        res.redirect("/teachers");

    }catch(error){
       console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect('/teachers');
    }
}

exports.view = async (req, res) => {
    try {
        const id = req.params.id; 
        const teacher = await User.findById(id);
        if (!teacher) {
            return res.status(404).send("Teacher not found");
        }
        res.render("backend/teacher/view", {
            teacher
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

exports.edit = async (req, res) => {
    try {
        const id = req.params.id; 
        const teacher = await User.findById(id);
        if (!teacher) {
            return res.status(404).send("Teacher not found");
        }
        res.render("backend/teacher/edit", {
            teacher
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
exports.update = async (req, res) => {
    try {
        const { teacher_id, name, email, phone, experience, gender } = req.body; 
        const teacher = await User.findById(teacher_id);
        if (!teacher) {
            req.flash("error", "Teacher not found");
            res.redirect("/teachers")
        }
         let teacher_photo = teacher.photo;
         if (req.file) {
            if (teacher.photo) {
                const oldPath = path.join(__dirname, "..", teacher.photo);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            teacher_photo = "/uploads/teachers/" + req.file.filename;
        }
        teacher.name = name;
        teacher.email = email;
        teacher.phone = phone;
        teacher.experience = experience;
        teacher.gender = gender;
        teacher.photo = teacher_photo;
        await teacher.save(); 
        
        req.flash("success", "Teacher updated successfully");
        res.redirect("/teachers");
    } catch (error) {
        console.error(error);
       req.flash("error", "Something went wrong");
       res.redirect("/teachers");
    }
};


exports.destroy = async (req, res) => {
    try{
        const { id } = req.params;
         if(!id){
            req.flash("error", "Invalid Request");
            res.redirect("/teachers");
        }   
        await User.findByIdAndDelete(id);
        req.flash("success", "Teacher has been deleted successfully");
        res.redirect("/teachers");
    }catch(error){
        req.flash("error", "Something went wrong");
        res.redirect("/teachers");
    }
}

exports.exportTeachers = async (req, res) => {
    try {
        const users = await User.find({
            user_role: 1
        }).lean();

        // 🔹 Transform data
        const formattedUsers = users.map(user => ({
            name: user.name,
            email: user.email,
            phone: user.phone,
            "Joining Date": user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN')
                : ''
        }));

        const fields = ['name', 'email', 'phone', 'Joining Date'];

        const parser = new Parser({ fields });
        const csv = parser.parse(formattedUsers);

        res.header('Content-Type', 'text/csv');
        res.attachment('teacher.csv');
        res.send(csv);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};