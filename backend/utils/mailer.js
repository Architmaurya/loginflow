// // import nodemailer from "nodemailer";

// // export const sendMail = async (to, subject, html) => {
// //   try {
// //     const transporter = nodemailer.createTransport({
// //       host: process.env.MAIL_HOST, // ⬅️ your SMTP host
// //       port: 465,                   // standard SMTPS port
// //       secure: true,                // use SSL/TLS
// //       auth: {
// //         user: process.env.MAIL_USER,
// //         pass: process.env.MAIL_PASS,
// //       },
// //     });

// //     const info = await transporter.sendMail({
// //       from: `"Your App" <${process.env.MAIL_USER}>`,
// //       to,
// //       subject,
// //       html,
// //     });

// //     console.log("📧 Email sent:", info.response);
// //     return info;

// //   } catch (error) {
// //     console.error("❌ EMAIL SEND ERROR:", error.message);
// //     return null;
// //   }
// // };
// import sgMail from "@sendgrid/mail";

// // --- Configuration ---
// // 1. Set the SendGrid API Key using an environment variable
// //    You must have process.env.SENDGRID_API_KEY defined.
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // 2. Ensure you have a process.env.MAIL_SENDER defined
// //    This email must be a verified sender in your SendGrid account.
// const SENDER_EMAIL = process.env.MAIL_SENDER;

// export const sendMail = async (to, subject, html) => {
//   if (!SENDER_EMAIL) {
//     console.error("❌ SENDGRID ERROR: MAIL_SENDER environment variable is not set.");
//     return null;
//   }
  
//   try {
//     const msg = {
//       to: to,
//       from: `"Your App" <${SENDER_EMAIL}>`, // Use the verified SendGrid sender email
//       subject: subject,
//       html: html,
//     };

//     // Use the SendGrid API to send the email
//     const [response] = await sgMail.send(msg);

//     console.log("📧 Email sent via SendGrid. Status:", response.statusCode);
    
//     // SendGrid returns an array of responses, we return the first one for consistency
//     return response; 

//   } catch (error) {
//     console.error("❌ EMAIL SEND ERROR (SendGrid):", error.message);
    
//     // Log detailed SendGrid response error if available
//     if (error.response) {
//       console.error("↳ Response Body:", error.response.body);
//     }
//     return null;
//   }
// };
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// This is your email domain or from email (must be verified in Resend)
const SENDER_EMAIL = process.env.MAIL_SENDER; 
// Example: no-reply@yourdomain.com OR onboarding@resend.dev

export const sendMail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ ERROR: RESEND_API_KEY is missing in environment variables!");
    return null;
  }

  if (!SENDER_EMAIL) {
    console.error("❌ ERROR: MAIL_SENDER is missing in environment variables!");
    return null;
  }

  try {
    const response = await resend.emails.send({
      from: `Your App <${SENDER_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("📧 Email sent via Resend → ID:", response?.data?.id);
    return response;

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR (Resend):", error.message);

    if (error?.response?.data) {
      console.error("↳ Resend API Error:", error.response.data);
    }
    return null;
  }
};
