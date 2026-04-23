exports.AssignTeacherEmail = (teacher_detail, user_detail, orderData) => {

  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:#673AB7;padding:20px;text-align:center;color:#fff;">
                <h1 style="margin:0;">New Course Assigned 📚</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333;">
                <h2>Hello ${teacher_detail.name},</h2>
                <p style="font-size:16px;line-height:1.6;">
                  A new course/order has been assigned to you.
                </p>
                <!-- Student Info -->
                <h3>Student Details</h3>
                <p><strong>Name:</strong> ${user_detail.name}</p>
                <p><strong>Email:</strong> ${user_detail.email}</p>
                <p><strong>Phone:</strong> ${user_detail.phone}</p>

                <!-- Order Info -->
                <h3>Order Details</h3>
                <p><strong>Order Date:</strong> ${orderData.date}</p>
                <p><strong>Total Amount:</strong> ₹ ${orderData.total_amount}</p>

                <!-- Courses -->
                <h3>Assigned Courses</h3>
                <ul style="padding-left:20px;">
                   <li style="margin-bottom:8px;">
                    <strong>${orderData.course.name}</strong> (${orderData.course.type})
                    </li>
                </ul>
                <!-- Button -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="https://vidyamalika.com/teacher/dashboard" 
                     style="background:#673AB7;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;">
                     View Dashboard
                  </a>
                </div>
                <p style="font-size:14px;color:#777;">
                  Please log in and start managing this course.
                </p>
                <p>Thanks,<br/>Team Vidya Malika</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;color:#888;">
                © 2026 Vidya Malika. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
};