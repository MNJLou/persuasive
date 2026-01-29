import { Resend } from 'resend';

export default async function handler(req, res) {
  console.log("=== SEND EMAIL DEBUG START ===");
  console.log("Method:", req.method);
  console.log("Environment variables check:");
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  console.log("  - RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
  console.log("  - RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length);
  console.log("  - RESEND_API_KEY first 5 chars:", process.env.RESEND_API_KEY?.substring(0, 5));
  console.log("  - RESEND_API_KEY last 5 chars:", process.env.RESEND_API_KEY?.slice(-5));
  console.log("  - Has quotes?", process.env.RESEND_API_KEY?.includes('"'));
  console.log("=== SEND EMAIL DEBUG END ===");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    email, 
    firstName, 
    surname, 
    cellphone, 
    streetAddress, 
    apartment, 
    suburb, 
    city, 
    postcode, 
    country,
    cartItems, 
    total, 
    subtotal 
  } = req.body;

  if (!email || !firstName || !cartItems || total === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is undefined");
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'RESEND_API_KEY environment variable is not set'
    });
  }

  try {
    // Initialize Resend here
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend initialized successfully");

    // Format order items for email
    const orderItemsHtml = cartItems
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ${item.shirtColor} shirt with ${item.embroideryColor} embroidery (${item.size})
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          R${item.price.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f9fafb;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 0;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .total-row {
              font-weight: bold;
              color: #2563eb;
              font-size: 18px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .next-steps {
              background-color: #eff6ff;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Payment Successful!</h1>
              <p>Thank you for your order, ${firstName}</p>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <table>
                <thead>
                  <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                  <tr style="background-color: #f9fafb;">
                    <td style="padding: 8px; font-weight: bold;">Subtotal</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">R${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td style="padding: 12px;">Total</td>
                    <td style="padding: 12px; text-align: right;">R${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="next-steps">
                <div class="section-title" style="margin-bottom: 10px; margin-top: 0;">Delivery Address</div>
                <p style="margin: 0 0 10px 0; color: #333;">
                  <strong>${firstName} ${surname}</strong><br>
                  ${streetAddress}${apartment ? ', ' + apartment : ''}<br>
                  ${suburb}, ${city} ${postcode}<br>
                  ${country}<br>
                  <strong>Phone:</strong> ${cellphone}
                </p>
              </div>
            </div>

            <div class="section">
              <div class="next-steps">
                <div class="section-title" style="margin-bottom: 10px; margin-top: 0;">What's Next?</div>
                <ul style="margin: 0; padding-left: 20px; color: #2563eb;">
                  <li>We're preparing your custom shirt(s)</li>
                  <li>You'll receive tracking updates via email</li>
                  <li>Expected delivery: 5-7 business days</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>If you have any questions, please contact us at alessandrodestefano22@gmail.com</p>
              <p>© 2026 Persuasive. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("📧 Attempting to send customer email...");
    
    const customerEmailResponse = await resend.emails.send({
      from: 'Persuasive <alessandro@contact.persuasive.online>',
      to: email,
      subject: '✓ Order Confirmation - Your Custom Shirts',
      html: customerEmailHtml,
    });

    console.log('✅ Customer email sent:', customerEmailResponse);

    // Owner email with full order details
    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f9fafb;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #dc2626;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #dc2626;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9fafb;
              border-left: 4px solid #2563eb;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .total-row {
              font-weight: bold;
              color: #dc2626;
              font-size: 18px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 10px 0;
            }
            .info-block {
              padding: 10px;
              background-color: white;
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              color: #2563eb;
              font-size: 12px;
              text-transform: uppercase;
            }
            .info-value {
              color: #333;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ NEW ORDER RECEIVED</h1>
              <p>Order from: ${firstName} ${surname}</p>
            </div>

            {/* Customer Information */}
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="customer-info">
                <div class="info-block">
                  <div class="info-label">Name</div>
                  <div class="info-value">${firstName} ${surname}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Email</div>
                  <div class="info-value"><a href="mailto:${email}">${email}</a></div>
                </div>
                <div class="info-block">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${cellphone}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Country</div>
                  <div class="info-value">${country}</div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div class="section">
              <div class="section-title">Delivery Address</div>
              <div class="info-value">
                <strong>${firstName} ${surname}</strong><br>
                ${streetAddress}${apartment ? '<br>' + apartment : ''}<br>
                ${suburb}<br>
                ${city}, ${postcode}<br>
                ${country}
              </div>
            </div>

            {/* Order Details */}
            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Size</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                  <tr style="background-color: white;">
                    <td style="padding: 8px; font-weight: bold;">Subtotal</td>
                    <td></td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">R${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row" style="background-color: #fef2f2;">
                    <td style="padding: 12px;">TOTAL (excluding shipping)</td>
                    <td></td>
                    <td style="padding: 12px; text-align: right;">R${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Required */}
            <div class="section" style="border-left-color: #dc2626; background-color: #fef2f2;">
              <div class="section-title" style="color: #dc2626;">⚠️ Action Required</div>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Calculate shipping costs for this order</li>
                <li>Send shipping payment details to customer</li>
                <li>Begin order preparation once payment is confirmed</li>
              </ul>
            </div>

            <div class="footer">
              <p>This is an automated order notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("📧 Attempting to send owner email...");

    const ownerEmailResponse = await resend.emails.send({
      from: 'Persuasive Orders <alessandro@contact.persuasive.online>',
      to: 'alessandrodestefano22@gmail.com', // Replace with actual email
      subject: `🛍️ New Order from ${firstName} ${surname} - R${total.toFixed(2)}`,
      html: ownerEmailHtml,
    });

    console.log('✅ Owner email sent:', ownerEmailResponse);

    return res.status(200).json({ 
      success: true, 
      customerEmailId: customerEmailResponse.id,
      ownerEmailId: ownerEmailResponse.id
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to send confirmation email',
      details: error.message,
      name: error.name
    });
  }
}