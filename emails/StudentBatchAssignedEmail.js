exports.StudentBatchAssignedEmail = ({ student, teacher, batch }) => {
  return `
  <div style="font-family:Arial;background:#f4f6f8;padding:20px;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;">
      
      <div style="background:#009688;color:#fff;padding:20px;text-align:center;">
        <h2>Batch Assigned 🎓</h2>
      </div>

      <div style="padding:20px;">
        <h3>Hello ${student.name},</h3>

        <p>Your batch has been successfully assigned.</p>

        <h4>📚 Course Details</h4>
        <p><strong>Course:</strong> ${batch.course_name}</p>
        <p><strong>Type:</strong> ${batch.course_type}</p>

        <h4>👨‍🏫 Teacher Details</h4>
        <p><strong>Name:</strong> ${teacher.name}</p>
        <p><strong>Email:</strong> ${teacher.email}</p>

        <h4>⏰ Batch Info</h4>
        <p><strong>Batch:</strong> ${batch.batch_name || 'N/A'}</p>
        <p><strong>Start Date:</strong> ${batch.start_date}</p>
        <p><strong>Timing:</strong> ${batch.timing}</p>

        <div style="text-align:center;margin:20px 0;">
          <a href="https://vidyamalika.com/dashboard"
             style="background:#009688;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
             Go to Dashboard
          </a>
        </div>

        <p>Thanks,<br/>Team Vidya Malika</p>
      </div>

      <div style="background:#f1f1f1;padding:10px;text-align:center;font-size:12px;">
        © 2026 Vidya Malika
      </div>

    </div>
  </div>
  `;
};