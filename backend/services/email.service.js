const { BrevoClient } = require("@getbrevo/brevo");

const apiKey = process.env.BREVO_API_KEY;
const brevo = apiKey ? new BrevoClient({ apiKey }) : null;

module.exports.sendPasswordResetEmail = async ({ to, resetUrl }) => {
  if (!brevo || !process.env.EMAIL_FROM) {
    throw new Error("Password reset email service is not configured");
  }

  return brevo.transactionalEmails.sendTransacEmail({
    subject: "Reset your PDF Insight password",
    sender: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || "PDF Insight",
    },
    to: [{ email: to }],
    textContent: `Reset your PDF Insight password: ${resetUrl}\n\nThis link expires in 15 minutes.`,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202124"><h1>PDF Insight</h1><h2>Reset your password</h2><p>We received a request to reset your password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#1769aa;color:#fff;text-decoration:none;border-radius:4px">Reset Password</a></p><p>This link will expire in 15 minutes.</p><p>If you did not request this password reset, you can safely ignore this email.</p></div>`,
  });
};