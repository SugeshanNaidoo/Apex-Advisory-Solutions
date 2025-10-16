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
    const { name, email, phone, company, service, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Prepare email content
    const emailContent = `
      New Contact Form Submission - Apex Advisory Solutions
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Company: ${company || 'Not provided'}
      Service: ${service || 'Not specified'}
      
      Message:
      ${message}
      
      ---
      Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
    `;

    // For development/testing, log the submission
    console.log('Contact Form Submission:', {
      name,
      email,
      phone,
      company,
      service,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, you would send an email here
    // Example with SendGrid, Nodemailer, or other email service:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      // Your email service configuration
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'info@apexadvisory.co.za',
      subject: 'New Contact Form Submission',
      text: emailContent
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank you for contacting Apex Advisory Solutions',
      html: `
        <h2>Thank you for your inquiry</h2>
        <p>Dear ${name},</p>
        <p>Thank you for contacting Apex Advisory Solutions. We have received your message and will respond within 24 hours.</p>
        <p>For urgent matters, please call us directly at <strong>+27 (0)11 784 5600</strong>.</p>
        <br>
        <p>Best regards,<br>Apex Advisory Solutions Team</p>
      `
    });
    */

    // For now, simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

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