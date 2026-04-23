exports.ForgetPasswordOtpEmail = (user, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
    </head>
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
            <tr>
                <td align="center">

                    <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background:#4f46e5; padding:20px; text-align:center; color:#ffffff; font-size:20px; font-weight:bold;">
                                Vidya Malika
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:30px;">
                                <h2 style="margin:0 0 10px; color:#333;">Password Reset Request</h2>

                                <p style="margin:0 0 20px; color:#555; font-size:14px;">
                                    Hello ${user.name || "User"},
                                </p>

                                <p style="margin:0 0 20px; color:#555; font-size:14px;">
                                    We received a request to reset your password. Use the OTP below to proceed:
                                </p>

                                <!-- OTP Box -->
                                <div style="text-align:center; margin:30px 0;">
                                    <span style="display:inline-block; font-size:28px; letter-spacing:6px; font-weight:bold; color:#4f46e5; background:#f3f4f6; padding:12px 20px; border-radius:6px;">
                                        ${otp}
                                    </span>
                                </div>

                                <p style="margin:0 0 10px; color:#555; font-size:13px;">
                                    If you did not request this, you can safely ignore this email.
                                </p>

                                <p style="margin:0; color:#999; font-size:12px;">
                                    For security reasons, do not share this OTP with anyone.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888;">
                                © ${new Date().getFullYear()} Vidya Malika. All rights reserved.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};