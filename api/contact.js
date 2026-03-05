import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, phone, company, service, message } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // ── Internal notification email (plain text) ────────────────────────────
    const internalEmailContent = `
New Contact Form Submission — Apex Advisory Solutions
${'─'.repeat(50)}

Name:    ${name}
Email:   ${email}
Phone:   ${phone   || 'Not provided'}
Company: ${company || 'Not provided'}
Service: ${service || 'Not specified'}

Message:
${message}

${'─'.repeat(50)}
Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `.trim();

    // ── Client auto-reply email (HTML) ──────────────────────────────────────
    const clientEmailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .header { background: #0f172a; color: white; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0 0 6px; font-size: 22px; }
    .header p  { margin: 0; opacity: 0.8; font-size: 14px; }
    .content { padding: 28px 24px; }
    .highlight-box { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .highlight-box p { margin: 4px 0; font-size: 14px; color: #475569; }
    .contact-box { background: #eff6ff; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .contact-box h3 { margin: 0 0 10px; color: #0f172a; font-size: 16px; }
    .contact-box p { margin: 4px 0; font-size: 14px; color: #475569; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank You for Contacting Us</h1>
    <p>Apex Advisory Solutions</p>
  </div>

  <div class="content">
    <p>Dear ${name},</p>
    <p>Thank you for reaching out to Apex Advisory Solutions. We have received your message and a member of our team will respond within <strong>24 hours</strong>.</p>

    <div class="highlight-box">
      <p><strong>Your enquiry:</strong></p>
      <p>${message}</p>
    </div>

    <div class="contact-box">
      <h3>Need to reach us directly?</h3>
      <p>Avathar Naidoo: +27-82-315-4737</p>
      <p>Ashendran Naidoo: +27-65-895-4832</p>
      <p>info.apexadvisorysolutions@gmail.com</p>
      <p>Mon–Fri: 08:00–17:00 | Sat: 09:00–13:00</p>
    </div>

    <p>Best regards,<br><strong>Apex Advisory Solutions</strong><br><em>Business Restructuring Experts</em></p>
  </div>

  <div class="footer">
    <p>Apex Advisory Solutions (Pty) Ltd | Reg: 2025/123456/07<br>
    Sandton, Gauteng, South Africa<br>
    This email and any attachments are confidential and may be privileged.</p>
  </div>
</body>
</html>
    `.trim();

    // ── Send emails ─────────────────────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Internal notification
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      'info.apexadvisorysolutions@gmail.com',
      cc:      'avathar@apexadvisory.co.za, ashendran@apexadvisory.co.za',
      subject: `New Enquiry — ${name}${company ? ` | ${company}` : ''}${service ? ` | ${service}` : ''}`,
      text:    internalEmailContent
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: 'Thank You for Contacting Apex Advisory Solutions',
      html:    clientEmailContent
    });

    console.log(`Contact form: ${name} | ${email} | ${service || 'no service'}`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send message. Please try again.'
    });
  }
}