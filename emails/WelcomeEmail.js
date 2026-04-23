exports.WelcomeEmail = (user) => {
  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          
          <table width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#4CAF50;padding:20px;text-align:center;color:#fff;">
                <h1 style="margin:0;">Welcome 🎉</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333;">
                <h2>Hello ${user.name},</h2>
                <p style="font-size:16px;line-height:1.6;">
                  Welcome to <strong>Vidya Malika</strong>! We're excited to have you on board.
                </p>

                <p style="font-size:16px;line-height:1.6;">
                  You can now explore courses, manage your account, and start your journey with us.
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="https://vidyamalika.com" 
                     style="background:#4CAF50;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;">
                     Get Started
                  </a>
                </div>

                <p style="font-size:14px;color:#777;">
                  If you have any questions, feel free to reply to this email.
                </p>

                <p>Thanks,<br/>Team</p>
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