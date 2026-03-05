import nodemailer from "nodemailer";

const rateLimit = new Map();

function isRateLimited(ip) {

  const now = Date.now();
  const windowMs = 60000;
  const limit = 5;

  if (!rateLimit.has(ip)) rateLimit.set(ip, []);

  const requests = rateLimit.get(ip).filter(t => now - t < windowMs);

  if (requests.length >= limit) return true;

  requests.push(now);

  rateLimit.set(ip, requests);

  return false;

}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    service,
    date,
    time,
    details,
    consent,
    website
  } = req.body;

  // Honeypot
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!firstName || !lastName || !email || !service || !date || !time || !details || !consent) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const appointment = new Date(`${date}T${time}`);

  if (isNaN(appointment)) {
    return res.status(400).json({ error: "Invalid date" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const fullName = `${firstName} ${lastName}`;

  await transporter.sendMail({

    from: process.env.EMAIL_FROM,

    to: "info.apexadvisorysolutions@gmail.com",

    subject: `New Consultation Booking — ${fullName}`,

    text: `
Client: ${fullName}
Email: ${email}
Phone: ${phone}

Service: ${service}
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

}