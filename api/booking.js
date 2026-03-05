const nodemailer = require("nodemailer");

const rateLimit = new Map();

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
    consent,
    website
  } = req.body || {};

  // Honeypot
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !service ||
    !date ||
    !time ||
    !details ||
    !consent
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const appointment = new Date(`${date}T${time}`);

  if (isNaN(appointment)) {
    return res.status(400).json({ error: "Invalid date/time" });
  }

  const fullName = `${firstName} ${lastName}`;

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

      subject: `New Consultation Booking — ${fullName}`,

      text: `
Client: ${fullName}
Email: ${email}
Phone: ${phone}

Company: ${company || "Not provided"}
Position: ${position || "Not provided"}

Service: ${service}
Format: ${format || "Not specified"}
Urgency: ${urgency || "Standard"}

Date: ${date}
Time: ${time}

Details:
${details}
`

    });

    res.status(200).json({
      success: true,
      reference: `AAS-${Date.now()}`
    });

  } catch (err) {

    console.error("Booking error:", err);

    res.status(500).json({
      error: "Failed to process booking"
    });

  }

};