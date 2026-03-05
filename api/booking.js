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
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      service,
      date,
      time,
      format,
      urgency,
      details,
      consent
    } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!firstName || !lastName || !email || !phone || !company || !service || !date || !time || !format || !details) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!consent) {
      res.status(400).json({ error: 'Consent is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      res.status(400).json({ error: 'Appointment date must be in the future' });
      return;
    }

    // ── Format date & time ──────────────────────────────────────────────────
    const fullName = `${firstName} ${lastName}`;
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    const formattedDate = appointmentDateTime.toLocaleDateString('en-ZA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString('en-ZA', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const urgencyLabel =
      urgency === 'critical' ? 'CRITICAL/EMERGENCY' :
      urgency === 'urgent'   ? 'URGENT'             : 'Standard';

    // ── Internal notification email (plain text) ────────────────────────────
    const internalEmailContent = `
New Consultation Booking — Apex Advisory Solutions
${'─'.repeat(50)}

CLIENT INFORMATION
Name:     ${fullName}
Email:    ${email}
Phone:    ${phone}
Company:  ${company}
Position: ${position || 'Not provided'}

APPOINTMENT DETAILS
Service:  ${service}
Date:     ${formattedDate}
Time:     ${formattedTime}
Format:   ${format}
Urgency:  ${urgencyLabel}

CLIENT REQUIREMENTS
${details}

${'─'.repeat(50)}
Booked: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
Consent Given: Yes
    `.trim();

    // ── Client confirmation email (HTML) ────────────────────────────────────
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
    .details-box { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .details-box p { margin: 6px 0; font-size: 15px; }
    .steps { background: #f8fafc; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .steps ol { margin: 8px 0 0; padding-left: 20px; }
    .steps li { margin-bottom: 6px; font-size: 14px; color: #475569; }
    .contact-box { background: #eff6ff; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .contact-box h3 { margin: 0 0 10px; color: #0f172a; font-size: 16px; }
    .contact-box p { margin: 4px 0; font-size: 14px; color: #475569; }
    .urgent-badge { display: inline-block; background: #dc2626; color: white; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; margin-top: 8px; }
    .priority-badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; margin-top: 8px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Consultation Booking Confirmation</h1>
    <p>Apex Advisory Solutions</p>
  </div>

  <div class="content">
    <p>Dear ${fullName},</p>
    <p>Thank you for booking a consultation with Apex Advisory Solutions. We have received your request and our team will contact you within <strong>24 hours</strong> to confirm your appointment.</p>

    <div class="details-box">
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Format:</strong> ${format}</p>
      <p><strong>Service:</strong> ${service}</p>
      ${urgency === 'critical' ? '<span class="urgent-badge">CRITICAL — We will contact you immediately</span>' : ''}
      ${urgency === 'urgent'   ? '<span class="priority-badge">URGENT — We will expedite your booking</span>'  : ''}
    </div>

    <div class="steps">
      <strong>What happens next?</strong>
      <ol>
        <li>Our team will review your requirements and contact you within 24 hours</li>
        <li>We'll confirm your appointment slot or suggest alternatives if needed</li>
        <li>You'll receive a calendar invitation with full meeting details</li>
        <li>Our consultant will prepare specifically for your requirements</li>
      </ol>
    </div>

    <div class="contact-box">
      <h3>Need immediate assistance?</h3>
      <p>Avathar Naidoo: +27-82-315-4737</p>
      <p>Ashendran Naidoo: +27-65-895-4832</p>
      <p>info.apexadvisorysolutions@gmail.com</p>
      <p>Mon–Fri: 08:00–17:00 | Sat: 09:00–13:00</p>
    </div>

    <p>We look forward to helping you achieve your business objectives.</p>
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

    // Internal notification to both directors
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      'info.apexadvisorysolutions@gmail.com',
      cc:      'avathar@apexadvisory.co.za, ashendran@apexadvisory.co.za',
      subject: `[${urgencyLabel}] New Booking — ${fullName} | ${service}`,
      text:    internalEmailContent
    });

    // Confirmation to client
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: 'Consultation Booking Confirmation — Apex Advisory Solutions',
      html:    clientEmailContent
    });

    console.log(`Booking confirmed: ${fullName} | ${service} | ${formattedDate} ${formattedTime}`);

    res.status(200).json({
      success: true,
      message: 'Consultation booked successfully',
      booking: {
        reference: `AAS-${Date.now()}`,
        fullName,
        email,
        date: formattedDate,
        time: formattedTime,
        format,
        service
      }
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to book consultation. Please try again or call us directly.'
    });
  }
}