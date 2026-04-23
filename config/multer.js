const multer = require("multer");
const path = require("path");
const fs = require("fs");


const createUploader = (folderName) => {
    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            const uploadPath = `public/uploads/${folderName}`;
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: function(req, file, cb){
            const unique_name = Date.now() + "_" + Math.round(Math.random()*1E9);
            const ext = path.extname(file.originalname);
            cb(null, unique_name + ext);
        }
    });

    const fileFilter = (req, file, cb) => {
        let allowedTypes;
        // thumbnail should be image
        if(file.fieldname === "thumbnail"){
            allowedTypes = /jpeg|jpg|png|webp/;
        }
        if(file.fieldname === "subject_image"){
            allowedTypes = /jpeg|jpg|png|webp/;
        }
        if(file.fieldname === "category_image"){
            allowedTypes = /jpeg|jpg|png|webp/;
        }
       
         if(file.fieldname === "logo"){
            allowedTypes = /jpeg|jpg|png/;
        }
         if(file.fieldname === "teacher_photo"){
            allowedTypes = /jpeg|jpg|png/;
        }
         if(file.fieldname === "favicon"){
            allowedTypes = /jpeg|jpg|png/;
        }
        // lesson videos
        if(file.fieldname === "video_file[]"){
            allowedTypes = /mp4|mkv|mov|avi|webm/;
        }else if (file.fieldname.startsWith("video_file_")) { 
            allowedTypes = /mp4|mkv|mov|avi|webm/;
        }
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if(extname && mimetype){
            cb(null,true);
        }else{
            cb(new Error("Invalid file type"));
        }
    };
    return multer({ storage, fileFilter });
};
module.exports = createUploader;




// const createUploader = (folderName) => {
//         const storage = multer.diskStorage({
//             destination: function(req, file, cb){
//                 const uploadPath = `public/uploads/${folderName}`;
//                 // create folder automatically if not exists
//                 fs.mkdirSync(uploadPath, {recursive: true});
//                 cb(null, uploadPath);
//             },
//             filename: function(req, file, cb){
//                 const unique_name = Date.now() + "_" + Math.round(Math.random()*1E9);
//                 const ext = path.extname(file.originalname);
//                 cb(null, unique_name + ext);
//             }
//         });
//         const fileFilter = (req, file, cb) => {
//             const allowedTypes = /jpeg|jpg|png|webp/;
//             const ext_name = allowedTypes.test(
//                 path.extname(file.originalname).toLowerCase()
//             );
//             const mimetype = allowedTypes.test(file.mimetype);

//             if(ext_name && mimetype){
//                 cb(null, true);
//             }else{
//                 cb(new Error("Only images are allowed"));
//             }
//         };
//         return multer({
//             storage,
//             fileFilter
//         });
// };
// module.exports = createUploader;