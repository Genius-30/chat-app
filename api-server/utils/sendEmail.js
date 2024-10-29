import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const __dirname = path.resolve();
const templatePath = path.join(__dirname, "emails", "/VerificationEmail.html");
const emailTemplate = fs.readFileSync(templatePath, "utf8");

const sendVerificationEmail = async (
  username,
  email,
  verificationLink,
  otp
) => {
  await transporter.sendMail({
    from: `ChatApp <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: emailTemplate
      .replace("{{username}}", username)
      .replace("{{otp}}", otp)
      .replace("{{verificationLink}}", verificationLink),
  });
};

export default sendVerificationEmail;
