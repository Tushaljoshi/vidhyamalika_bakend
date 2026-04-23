exports.OrderConfirmationEmail = (user, order) => {
    const courseRows = order.items.map((course, index) => `
        <tr>
        <td style="padding:10px;border:1px solid #ddd;">${index + 1}</td>
        <td style="padding:10px;border:1px solid #ddd;">${course.name}</td>
        <td style="padding:10px;border:1px solid #ddd;">${course.type}</td>
        <td style="padding:10px;border:1px solid #ddd;">₹ ${course.price}</td>
        </tr>
    `).join("");

  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          
          <table width="650" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#4CAF50;padding:20px;text-align:center;color:#fff;">
                <h1 style="margin:0;">Order Confirmed </h1>
              </td>
            </tr>

            <!-- User Details -->
            <tr>
              <td style="padding:20px;">
                <h3>Student Details</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>
              </td>
            </tr>

            <!-- Order Details -->
            <tr>
              <td style="padding:20px;">
                <h3>Order Details</h3>
                <p><strong>Order Date:</strong> ${order.createdAt}</p>
                <p><strong>Order Status:</strong> ${order.order_status}</p>
                <p><strong>Payment Status:</strong> ${order.payment_status}</p>
              </td>
            </tr>

            <!-- Course Table -->
            <tr>
              <td style="padding:20px;">
                <h3>Course Details</h3>
                <table width="100%" style="border-collapse:collapse;">
                  <thead>
                    <tr style="background:#f1f1f1;">
                      <th style="padding:10px;border:1px solid #ddd;">#</th>
                      <th style="padding:10px;border:1px solid #ddd;">Course Name</th>
                      <th style="padding:10px;border:1px solid #ddd;">Type</th>
                      <th style="padding:10px;border:1px solid #ddd;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${courseRows}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- Total -->
            <tr>
              <td style="padding:20px;text-align:right;">
                <h2>Total: ₹ ${order.total_amount}</h2>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td style="text-align:center;padding:20px;">
                <a href="https://vidyamalika.com/dashboard" 
                   style="background:#4CAF50;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;">
                   View Dashboard
                </a>
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