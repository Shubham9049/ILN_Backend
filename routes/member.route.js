const express = require("express");
const router = express.Router();
const Member = require("../models/member.model");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt"); // Add this at the top
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // Store in .env
const countryMap = require("../countryMap.json");
const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

// Utility: Generate random 8-char password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const {
      email, // company email
      telephone, // company phone
      contactName,
      designation,
      primaryContactEmail,
      primaryContactPhone,
      ...rest
    } = req.body;

    // Check if company email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(409).json({ error: "Company email already exists." });
    }

    // Create first key member entry
    const keyMembers = [
      {
        name: contactName,
        role: designation,
        email: primaryContactEmail,
        phone: primaryContactPhone,
        image: "",
        description: "",
      },
    ];

    // Build member data
    const memberData = {
      ...rest,
      email,
      telephone,
      contactName,
      designation,
      primaryContactEmail,
      primaryContactPhone,
      keyMembers,
      logoUrl: req.file ? req.file.path : "",
    };

    const newMember = new Member(memberData);
    await newMember.save();

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Thank You for Your Expression of Interest – ILN Membership",
      html: `
        <p>Hi ${contactName},</p>
        <p>Thank you for expressing your interest in becoming a member of ILN. We’ve received your initial details and have begun reviewing your application.</p>
        <p>To help us complete the next stage of the review, please find attached a follow-up form requesting additional information about your organisation. Once you’ve completed the form, kindly reply to this email with the updated document attached.</p>
        
        <p>If you have any questions in the meantime, feel free to reach out.</p>
        <p>Kind Regards,<br/>The ILN Membership Team</p>
        
      `,
      attachments: [
        {
          filename: "ILN_Membership.doc",
          path: `${__dirname}/../assets/docs/ILN.docx`,
        },
      ],
    });

    res.status(201).json({
      message: "Member registered successfully!",
      logoUrl: memberData.logoUrl,
    });
  } catch (err) {
    console.error("Error creating member:", err.message);
    res.status(500).json({
      error: "Something went wrong.",
      details: err.message,
    });
  }
});

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
        memberId: member.memberId,
        companyName: member.companyName,
        logo: member.logoUrl,
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

      // ✅ Generate Member ID
      const country = member.country?.toLowerCase().trim();
      const countryCode = countryMap[country] || "XX"; // fallback if not found
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const year = new Date().getFullYear();
      const memberId = `${countryCode}${randomNumber}${year}`;

      const randomPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash password

      member.status = "Approved";
      member.password = hashedPassword;
      member.memberId = memberId;
      await member.save();

      await sendEmail({
        to: member.email,
        subject:
          "Welcome to Integrated Logistics Network (ILN) – Your Membership Has Been Approved",
        html: `
          <h3>Hi ${member.contactName},</h3>
          <p>Congratulations! Your membership application has been approved, and we’re thrilled to welcome you to the ILN community.</p>
          <p>To get you started, please find your login details for the ILN Member Portal below:</p>
          <p><strong>Member ID:</strong> ${memberId}</p>
          <p><strong>Login Email:</strong> ${member.email}</p>
          <p><strong>Password:</strong> ${randomPassword}</p>
          <p><strong>URL:</strong><a href="https://iln.vercel.app/Login">https://iln.vercel.app/Login</p>
          <p>We recommend logging in and updating your password at your earliest convenience. </p>
          <p>If you have any questions or need support getting started, please don’t hesitate to reach out.</p>
          <p>Kind Regards,</p>
          <p>The ILN Membership Team</p>
        `,
      });

      return res
        .status(200)
        .json({ message: "Member approved and notified.", memberId });
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

// GET all approved members except the logged-in user
router.get("/approvedMembers/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const members = await Member.find({
      status: "Approved",
      email: { $ne: email }, // exclude this email
    });

    res.json(members);
  } catch (err) {
    console.error("Error fetching approved members:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/members/:id - Get individual member details
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    console.error("Error fetching member:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/members/:email - Get individual member details
router.get("/profile/:email", async (req, res) => {
  try {
    const member = await Member.findOne({ email: req.params.email });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    console.error("Error fetching member:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.put(
  "/profile/:email",
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "memberImages" }]),
  async (req, res) => {
    try {
      const email = req.params.email;
      let updateData = {};

      if (req.is("multipart/form-data")) {
        updateData = { ...req.body };

        if (req.files["logo"] && req.files["logo"][0]) {
          updateData.logoUrl = req.files["logo"][0].path;
        }

        if (
          updateData.keyMembers &&
          typeof updateData.keyMembers === "string"
        ) {
          const keyMembers = JSON.parse(updateData.keyMembers);
          const uploadedImages = req.files["memberImages"] || [];

          const imageMap = {};
          for (const file of uploadedImages) {
            imageMap[file.originalname] = file.path;
          }

          const keyMembersWithImages = keyMembers.map((member) => {
            // Remove temp _id to allow Mongoose to generate new ObjectId
            if (
              member._id &&
              typeof member._id === "string" &&
              member._id.startsWith("temp-")
            ) {
              delete member._id;
            }

            return {
              ...member,
              image: imageMap[member._id] || member.image || "",
            };
          });

          updateData.keyMembers = keyMembersWithImages;
        }
      } else {
        updateData = req.body;
      }

      const updatedMember = await Member.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      );

      if (!updatedMember) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json(updatedMember);
    } catch (err) {
      console.error("Error updating member:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
