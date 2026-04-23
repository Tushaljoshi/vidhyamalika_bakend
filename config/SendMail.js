const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",   // FIXED (see next issue)
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.SendMail = async ({ to, subject, html }) => {
  return await transporter.sendMail({   //FIXED HERE
    from: `"Vidya Malika" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};