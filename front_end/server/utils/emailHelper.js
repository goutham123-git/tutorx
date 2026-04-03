const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Use Gmail App Password
  },
});

exports.sendVerificationEmail = async (to, link) => {
  await transporter.sendMail({
    from: `"tutorx" <${process.env.MAIL_USER}>`,
    to,
    subject: "Verify your tutorx teacher account",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;padding:32px 24px;">
        <div style="background:#1D9E75;width:48px;height:48px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
          <span style="color:#fff;font-size:22px;font-weight:bold;">E</span>
        </div>
        <h2 style="color:#1a1a1a;font-size:20px;margin-bottom:8px;">Verify your teacher account</h2>
        <p style="color:#777;font-size:14px;line-height:1.6;margin-bottom:24px;">
          Click the button below to verify your institution email and unlock all
          tutorx teacher features including paid rooms and marketplace listing.
        </p>
        <a href="${link}" style="
          display:inline-block;padding:12px 28px;
          background:#1D9E75;color:#fff;border-radius:8px;
          text-decoration:none;font-weight:600;font-size:14px;
        ">Verify My Email</a>
        <p style="color:#bbb;font-size:12px;margin-top:24px;">
          This link expires in 24 hours. If you didn't request this, ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #f0f0ee;margin:24px 0;"/>
        <p style="color:#ccc;font-size:11px;">tutorx · Connecting teachers and students</p>
      </div>
    `,
  });
};