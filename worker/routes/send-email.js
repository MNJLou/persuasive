import { Resend } from 'resend';
import { json, readJson } from '../lib/http.js';

function resendError(which, error) {
  const err = new Error(`Resend rejected the ${which} email: ${error.message || error.name}`);
  err.name = error.name || 'ResendError';
  return err;
}

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
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
    subtotal,
    discount,
    promoCode,
    ambassadorCode,
    orderRef,
    isAdminOrder
  } = await readJson(request);

  if (!email || !firstName || !cartItems || total === undefined) {
    return json({ error: 'Missing required fields' }, 400);
  }

  // Check if API key exists
  if (!env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is undefined");
    return json({ 
      error: 'Server configuration error',
      details: 'RESEND_API_KEY environment variable is not set'
    }, 500);
  }

  try {
    // Initialize Resend here
    const resend = new Resend(env.RESEND_API_KEY);
    console.log("✅ Resend initialized successfully");

    // Format order items for email. Caps read differently from tees.
    const describeItem = (item) => {
      if (item.productType === 'cap' || item.productName === 'Cap') {
        return `${item.productName || 'Cap'} — ${item.shirtColor} / ${item.embroideryColor} thread (${item.size})`;
      }
      if (item.productType === 'croptop') {
        return `${item.productName || 'Crop Top'} — ${item.shirtColor} / ${item.embroideryColor} thread (${item.size})`;
      }
      return `${item.shirtColor} shirt with ${item.embroideryColor} embroidery (${item.size})`;
    };

    const orderItemsHtml = cartItems
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          ${describeItem(item)}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          R${item.price.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    // Owner-only. A customer has no business seeing what their referrer earns,
    // so this never appears in the customer email. It keeps the inbox usable as
    // a cross-check against the D1 commission ledger.
    const ambassadorRowHtml = ambassadorCode
      ? `
                  <tr style="background-color: #f5f3ff;">
                    <td style="padding: 8px; font-weight: bold; color: #6d28d9;">Ambassador referral</td>
                    <td></td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #6d28d9;">${ambassadorCode}</td>
                  </tr>`
      : '';

    const hasDiscount = discount && discount > 0;
    const discountLabel = promoCode ? `Discount (${promoCode})` : 'Discount';

    // Customer email: 2-column table (Item | Price).
    const customerDiscountRowHtml = hasDiscount
      ? `
                  <tr style="background-color: #f9fafb;">
                    <td style="padding: 8px; font-weight: bold; color: #16a34a;">${discountLabel}</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #16a34a;">−R${discount.toFixed(2)}</td>
                  </tr>`
      : '';

    // Owner email: 3-column table (Item | Size | Price).
    const ownerDiscountRowHtml = hasDiscount
      ? `
                  <tr style="background-color: white;">
                    <td style="padding: 8px; font-weight: bold; color: #16a34a;">${discountLabel}</td>
                    <td></td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #16a34a;">−R${discount.toFixed(2)}</td>
                  </tr>`
      : '';

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
              <h1>✓ ${isAdminOrder ? 'Order Confirmed' : 'Payment Successful'}!</h1>
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
                  ${customerDiscountRowHtml}
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
              <p>If you have any questions, please contact us at alessandro.persuasive@gmail.com</p>
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

    // The SDK does not throw on API errors — it returns { data: null, error }.
    // Without this check a bad key or unverified domain logs "sent" and
    // answers 200 while nothing was delivered.
    if (customerEmailResponse.error) throw resendError('customer', customerEmailResponse.error);
    console.log('✅ Customer email sent:', customerEmailResponse.data?.id);

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
              ${orderRef ? `<p style="font-family:monospace; color:#6b7280; font-size:13px;">${orderRef}</p>` : ''}
              ${isAdminOrder ? '<p style="display:inline-block; margin-top:10px; padding:6px 12px; background-color:#fef3c7; color:#92400e; border:1px solid #f59e0b; border-radius:4px; font-weight:bold; font-size:13px;">⚙️ ADMIN-PLACED ORDER (no payment processed)</p>' : ''}
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
                  ${ownerDiscountRowHtml}
                  ${ambassadorRowHtml}
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
                ${ambassadorCode ? `<li>Commission is owed on this order to ambassador <strong>${ambassadorCode}</strong> — see the ledger in the admin site</li>` : ''}
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
      to: 'alessandro.persuasive@gmail.com', // Replace with actual email
      subject: `${isAdminOrder ? '[ADMIN] ' : ''}🛍️ New Order from ${firstName} ${surname} - R${total.toFixed(2)}`,
      html: ownerEmailHtml,
    });

    if (ownerEmailResponse.error) throw resendError('owner', ownerEmailResponse.error);
    console.log('✅ Owner email sent:', ownerEmailResponse.data?.id);

    return json({ 
      success: true, 
      customerEmailId: customerEmailResponse.data?.id,
      ownerEmailId: ownerEmailResponse.data?.id
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return json({
      error: 'Failed to send confirmation email',
      details: error.message,
      name: error.name
    }, 500);
  }
}