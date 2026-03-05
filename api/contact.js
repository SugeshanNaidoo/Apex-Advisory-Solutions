const nodemailer = require("nodemailer");

const rateLimit = new Map();

function sanitize(str) {
  return String(str || "").replace(/[<>]/g, "");
}

function isRateLimited(ip) {

  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 5;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter(t => now - t < windowMs);

  if (requests.length >= maxRequests) {
    return true;
  }

  requests.push(now);
  rateLimit.set(ip, requests);

  return false;
}

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }

  const { name, email, phone, company, service, message, website } = req.body || {};

  // Honeypot spam trap
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const safeName = sanitize(name);
  const safeMessage = sanitize(message);

  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({

      from: process.env.EMAIL_FROM,

      to: "info.apexadvisorysolutions@gmail.com",

      cc: "avathar@apexadvisory.co.za, ashendran@apexadvisory.co.za",

      subject: `New Enquiry — ${safeName}`,

      text: `
Name: ${safeName}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}
Service: ${service || "Not specified"}

Message:
${safeMessage}
`

    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully"
    });

  } catch (err) {

    console.error("Contact form error:", err);

    res.status(500).json({
      error: "Failed to send message"
    });

  }

};