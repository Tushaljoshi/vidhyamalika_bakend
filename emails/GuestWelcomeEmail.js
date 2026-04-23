exports.GuestWelcomeEmail = (user, password) => {
  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          
          <table width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#2196F3;padding:20px;text-align:center;color:#fff;">
                <h1 style="margin:0;">Your Account is Ready at Vidya Malika</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333;">
                <h2>Hello ${user.name},</h2>

                <p style="font-size:16px;line-height:1.6;">
                  Your account has been successfully created during checkout on 
                  <strong>Vidya Malika</strong>.
                </p>

                <p style="font-size:16px;line-height:1.6;">
                  You can now log in using the credentials below:
                </p>

                <!-- Credentials Box -->
                <div style="background:#f9f9f9;border:1px dashed #ccc;padding:20px;border-radius:8px;margin:20px 0;">
                  <p style="margin:5px 0;"><strong>Email:</strong> ${user.email}</p>
                  <p style="margin:5px 0;"><strong>Password:</strong> ${password}</p>
                </div>

                <p style="font-size:14px;color:#d32f2f;">
                  ⚠️ For security reasons, we recommend changing your password after login.
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="https://vidyamalika.com/login" 
                     style="background:#2196F3;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;">
                     Login to Your Account
                  </a>
                </div>

                <p style="font-size:14px;color:#777;">
                  If you did not create this account, please contact our support immediately.
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