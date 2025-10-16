export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
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

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !company || !service || !date || !time || !format || !details) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!consent) {
      res.status(400).json({ error: 'Consent is required' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Date validation (must be in the future)
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      res.status(400).json({ error: 'Appointment date must be in the future' });
      return;
    }

    const fullName = `${firstName} ${lastName}`;
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    const formattedDate = appointmentDateTime.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Prepare email content for internal team
    const internalEmailContent = `
      New Consultation Booking - Apex Advisory Solutions
      
      CLIENT INFORMATION:
      Name: ${fullName}
      Email: ${email}
      Phone: ${phone}
      Company: ${company}
      Position: ${position || 'Not provided'}
      
      APPOINTMENT DETAILS:
      Service: ${service}
      Date: ${formattedDate}
      Time: ${formattedTime}
      Format: ${format}
      Urgency: ${urgency || 'Standard'}
      
      CLIENT REQUIREMENTS:
      ${details}
      
      ---
      Booked: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
      Consent Given: Yes
    `;

    // Prepare confirmation email for client
    const clientEmailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .appointment-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 14px; color: #666; }
            .urgent { color: #dc2626; font-weight: bold; }
            .contact-info { margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Consultation Booking Confirmation</h1>
            <p>Apex Advisory Solutions</p>
          </div>
          
          <div class="content">
            <p>Dear ${fullName},</p>
            
            <p>Thank you for booking a consultation with Apex Advisory Solutions. We have received your booking request and our team will contact you within 24 hours to confirm your appointment.</p>
            
            <div class="appointment-details">
              <h3>Requested Appointment Details:</h3>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Format:</strong> ${format}</p>
              <p><strong>Service:</strong> ${service}</p>
              ${urgency === 'critical' ? '<p class="urgent">URGENT/CRITICAL REQUEST - We will prioritize your booking</p>' : ''}
              ${urgency === 'urgent' ? '<p style="color: #f59e0b; font-weight: bold;">URGENT REQUEST - We will expedite your booking</p>' : ''}
            </div>
            
            <h3>What happens next?</h3>
            <ol>
              <li>Our team will review your requirements and contact you within 24 hours</li>
              <li>We'll confirm your preferred appointment slot or suggest alternatives</li>
              <li>You'll receive a calendar invitation with meeting details</li>
              <li>Our expert consultant will prepare for your specific needs</li>
            </ol>
            
            <div class="contact-info">
              <h3>Need immediate assistance?</h3>
              <p><strong>Phone:</strong> +27 (0)11 784 5600</p>
              <p><strong>Mobile:</strong> +27 (0)82 456 7890</p>
              <p><strong>Email:</strong> consulting@apexadvisory.co.za</p>
              
              <p><strong>Office Hours:</strong><br>
              Monday - Friday: 08:00 - 17:00<br>
              Saturday: 09:00 - 13:00</p>
            </div>
            
            <p>We look forward to helping you achieve your business objectives.</p>
            
            <p>Best regards,<br>
            <strong>Apex Advisory Solutions</strong><br>
            Business Restructuring Experts</p>
          </div>
          
          <div class="footer">
            <p>Apex Advisory Solutions (Pty) Ltd | Registration: 2025/123456/07<br>
            Sandton City Office Towers, 5th Floor, South Tower, Sandton, Gauteng 2196<br>
            This email and any attachments are confidential and may be privileged.</p>
          </div>
        </body>
      </html>
    `;

    // Log booking for development/testing
    console.log('Booking Submission:', {
      fullName,
      email,
      phone,
      company,
      service,
      appointmentDate: appointmentDateTime.toISOString(),
      format,
      urgency,
      timestamp: new Date().toISOString()
    });

    // In production, send emails here
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      // Your email service configuration
    });

    // Send to internal team
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'consulting@apexadvisory.co.za',
      cc: 'info@apexadvisory.co.za',
      subject: `New Consultation Booking - ${fullName} (${urgency === 'critical' ? 'URGENT' : urgency === 'urgent' ? 'PRIORITY' : 'Standard'})`,
      text: internalEmailContent
    });

    // Send confirmation to client
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Consultation Booking Confirmation - Apex Advisory Solutions',
      html: clientEmailContent
    });

    // If urgent or critical, send SMS notification (optional)
    if (urgency === 'critical' || urgency === 'urgent') {
      // SMS implementation here
    }
    */

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

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
    console.error('Booking form error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to book consultation. Please try again or call us directly.'
    });
  }
}