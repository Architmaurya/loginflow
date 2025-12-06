import nodemailer from "nodemailer";

export const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // ⬅️ your SMTP host
      port: 587,                   // standard SMTP port
      secure: false,               // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.response);
    return info;

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error.message);
    return null;
  }
};
