import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import { HttpStatus } from "../constants/index.js";

// ── Transporter created ONCE at module load — reused for every email ──────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Generic send helper ───────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Failed to send email. Please try again later.",
      [],
      error.stack
    );
  }
};

// ── Verification Email ────────────────────────────────────────────────────────
// most of it from down here is written by AI dont ask me if it doesn't works

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email — AUTH SYSTEM",
    text: `Hi ${user.name},\n\nVerify your email:\n${verifyUrl}\n\nExpires in 24 hours.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#f97316;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Auth Sys</h1>
        </div>
        <div style="background:#fafafa;padding:32px;border-radius:0 0 8px 8px">
          <h2 style="margin-top:0">Hello ${user.name}! 👋</h2>
          <p>Click the button to verify your email address.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${verifyUrl}"
               style="background:#f97316;color:#fff;padding:14px 32px;border-radius:6px;
                      font-weight:600;font-size:15px;text-decoration:none;display:inline-block">
              Verify Email ✉️
            </a>
          </div>
          <p style="color:#888;font-size:13px">This link expires in 24 hours.</p>
          <p style="background:#eee;padding:10px;border-radius:4px;word-break:break-all;font-size:11px;color:#555">
            ${verifyUrl}
          </p>
        </div>
      </div>`,
  });
};

// ── Password Reset Email ──────────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password — AUTH SYSTEM",
    text: `Hi ${user.name},\n\nReset your password:\n${resetUrl}\n\nExpires in 1 hour.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#dc2626;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px"> Password Reset</h1>
        </div>
        <div style="background:#fafafa;padding:32px;border-radius:0 0 8px 8px">
          <h2 style="margin-top:0">Hello ${user.name},</h2>
          <p>We received a request to reset your password.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${resetUrl}"
               style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:6px;
                      font-weight:600;font-size:15px;text-decoration:none;display:inline-block">
              Reset Password 🔑
            </a>
          </div>
          <p style="color:#888;font-size:13px">Expires in 1 hour. Ignore if you didn't request this.</p>
        </div>
      </div>`,
  });
};

// ── Welcome Email (after verification) ───────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Welcome to AUTH SYSTEM",
    text: `Hi ${user.name}, your email is verified. You can now log in!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#16a34a;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px"> Welcome!</h1>
        </div>
        <div style="background:#fafafa;padding:32px;border-radius:0 0 8px 8px">
          <h2 style="margin-top:0">You're in, ${user.name}! 🎉</h2>
          <p>Your email is verified. Your account is fully active.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${process.env.CLIENT_URL}/login"
               style="background:#16a34a;color:#fff;padding:14px 32px;border-radius:6px;
                      font-weight:600;font-size:15px;text-decoration:none;display:inline-block">
              Go to Dashboard →
            </a>
          </div>
        </div>
      </div>`,
  });
}; 

export { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail };
