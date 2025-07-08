const express = require("express");
const router = express.Router();
const Member = require("../models/member.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt"); // Add this at the top
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // Store in .env

// Utility: Generate random 8-char password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// POST: Create new member
router.post("/", async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();

    // Send verification email
    await sendEmail({
      to: newMember.email,
      subject: "Document Verification Required - ILN Membership",
      html: `
        <p>Hi ${newMember.contactName},</p>
        <p>Thank you for registering with ILN.</p>
        <p>To complete your membership, please provide the following documents:</p>
        <ul>
          <li>Government ID Proof (Aadhar/PAN/Passport)</li>
          <li>Proof of Address</li>
          <li>Recent Passport Size Photograph</li>
        </ul>
        <p>You can submit the documents by replying to this email.</p>
        <p>Regards,<br/>ILN Team</p>
      `,
    });

    res.status(201).json({ message: "Member registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err.message });
  }
});

module.exports = router;

// POST: Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });

    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    if (member.status !== "Approved") {
      return res
        .status(403)
        .json({ error: "Your account is not approved yet." });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: member._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: member.email,
        name: member.contactName,
        status: member.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// PUT: Admin approves or rejects a member
router.put("/status/:id", async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  try {
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found." });
    }

    // === Handle Approval ===
    if (status === "Approved") {
      if (member.status === "Approved") {
        return res
          .status(200)
          .json({ message: "Member is already approved. No action taken." });
      }

      const randomPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash password

      member.status = "Approved";
      member.password = hashedPassword;
      await member.save();

      await sendEmail({
        to: member.email,
        subject: "Membership Approved",
        html: `
          <h3>Congratulations ${member.contactName},</h3>
          <p>Your membership has been <strong>approved</strong>.</p>
          <p><strong>Login Email:</strong> ${member.email}</p>
          <p><strong>Password:</strong> ${randomPassword}</p>
          <p>Please log in with this password or you can change it </p>
          <p>We've attached a PDF guide to help you get started with your membership.</p>
        `,
        attachments: [
          {
            filename: "ILN_Membership_Guide.doc",
            path: `${__dirname}/../assets/docs/ILN Membership Application Form.doc`, // adjust path as per your folder structure
          },
        ],
      });

      return res.status(200).json({ message: "Member approved and notified." });
    }

    // === Handle Rejection ===
    if (status === "Rejected") {
      member.status = "Rejected";
      member.password = ""; // Clear password
      await member.save();

      await sendEmail({
        to: member.email,
        subject: "Membership Rejected",
        html: `
          <h3>Hello ${member.contactName},</h3>
          <p>We regret to inform you that your membership has been <strong>rejected</strong>.</p>
          <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
        `,
      });

      return res
        .status(200)
        .json({ message: "Member rejected, password cleared, and notified." });
    }
  } catch (err) {
    res.status(500).json({
      error: "Failed to update status",
      details: err.message,
    });
  }
});

/**
 * Step 1: Send OTP to email
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const member = await Member.findOne({ email });
    if (!member) return res.status(404).json({ error: "Member not found" });

    if (member.status === "Rejected") {
      return res.status(403).json({
        error: "Your account has been rejected. Password reset is not allowed.",
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    member.otp = otp;
    member.otpExpiry = expiry;
    await member.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `
        <p>Hi ${member.contactName},</p>
        <p>Your OTP for password reset is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
});

/**
 * Step 2: Verify OTP and set new password
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const member = await Member.findOne({ email });
    if (!member) return res.status(404).json({ error: "Member not found" });

    if (member.status === "Rejected") {
      return res.status(403).json({
        error: "Your account has been rejected. You cannot set a new password.",
      });
    }

    if (
      member.otp !== otp ||
      !member.otpExpiry ||
      member.otpExpiry < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // 🔐 Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    member.password = hashedPassword;

    // Clear OTP and expiry
    member.otp = undefined;
    member.otpExpiry = undefined;

    await member.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to reset password", details: err.message });
  }
});
// GET: Get all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members." });
  }
});

module.exports = router;
