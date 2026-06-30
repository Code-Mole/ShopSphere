import nodemailer from "nodemailer";

// Create a reusable transporter once — shared across all email calls
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Core send function — all other helpers call this.
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// ─── Email Templates ──────────────────────────────────────────────────────

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your ShopSphere email",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #f0f0f0;">
        <h1 style="font-size:28px;font-weight:700;color:#111;margin:0 0 8px;">Welcome to ShopSphere 🛍️</h1>
        <p style="color:#555;font-size:15px;margin:0 0 24px;">Hi ${user.name}, please verify your email to get started.</p>
        <a href="${url}" style="display:inline-block;padding:14px 28px;background:#c026d3;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Verify Email</a>
        <p style="color:#999;font-size:13px;margin-top:24px;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>`,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your ShopSphere password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #f0f0f0;">
        <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px;">Password Reset</h1>
        <p style="color:#555;font-size:15px;margin:0 0 24px;">Hi ${user.name}, click below to reset your password.</p>
        <a href="${url}" style="display:inline-block;padding:14px 28px;background:#c026d3;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
        <p style="color:#999;font-size:13px;margin-top:24px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`,
  });
};

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: "Your email is verified — welcome to ShopSphere!",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #f0f0f0;">
        <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px;">You're all set, ${user.name}! 🎉</h1>
        <p style="color:#555;font-size:15px;">Your ShopSphere account is now active. Start exploring thousands of products and get AI-powered recommendations.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#c026d3;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Start Shopping</a>
      </div>`,
  });
};
