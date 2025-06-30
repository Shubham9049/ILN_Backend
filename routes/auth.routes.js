const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const sendWelcomeMessage = require("../utils/sendWhatsAppMessage");

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Use env variable in production

// Utility to generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpStore = new Map(); // Temporary in-memory store for OTPs

// ✅ Step 1: Send OTP
router.post("/send-otp", async (req, res) => {
  const { contactPerson, companyName, designation, companyAddress, email } =
    req.body;

  if (
    !contactPerson ||
    !companyName ||
    !designation ||
    !companyAddress ||
    !email
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    return res.status(400).json({ error: "Email already in use." });
  }

  const otp = generateOtp();

  // Store user details temporarily with OTP
  otpStore.set(email, {
    otp,
    contactPerson,
    companyName,
    designation,
    companyAddress,
  });

  // Send OTP via email
  await sendEmail({
    to: email,
    subject: "Email Verification - Close Friends Traders",
    text: `Your OTP is: ${otp}`,
    html: `<p>Hi ${contactPerson},</p><p>Your OTP is: <strong>${otp}</strong></p><p>Use this to complete your signup.</p>`,
  });

  res.json({ message: "OTP sent to your email." });
});

// ✅ Step 2: Verify OTP and Create Account
router.post("/verify-otp", async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const storedData = otpStore.get(email);
  if (!storedData || storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP." });
  }

  const { contactPerson, companyName, designation, companyAddress } =
    storedData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    contactPerson,
    companyName,
    designation,
    companyAddress,
    email,
    password: hashedPassword,
    confirmPassword: hashedPassword, // Not recommended to store this!
    isVerified: true,
  });

  await newUser.save();
  otpStore.delete(email); // Clear temp store

  await sendEmail({
    to: email,
    subject: "Welcome to Close Friends Traders!",
    text: `Welcome to Close Friends Traders, ${contactPerson}! Your account is now verified.`,
    html: `<p>Hi ${contactPerson},</p><p>Welcome aboard! Your account has been successfully verified.</p><p>Let's start your trading journey!</p>`,
  });

  res.status(201).json({ message: "Signup and verification successful." });
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const user = await User.findOne({ email });

  if (!user || !user.isVerified)
    return res
      .status(401)
      .json({ error: "Account not verified or doesn't exist." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials." });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });

  res.json({ message: "Login successful", token, user });
});

// ✅ Get All Users
router.get("/allUser", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// forget password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required." });

  const user = await User.findOne({ email });
  if (!user || !user.isVerified) {
    return res.status(404).json({ error: "User not found or not verified." });
  }

  const otp = generateOtp();
  otpStore.set(email, { otp, purpose: "reset-password" });

  await sendEmail({
    to: email,
    subject: "Password Reset OTP - Close Friends Traders",
    text: `Your password reset OTP is: ${otp}`,
    html: `<p>Hi ${user.contactPerson},</p><p>Your OTP to reset password is: <strong>${otp}</strong></p>`,
  });

  res.json({ message: "OTP sent to your email for password reset." });
});

// Reset passsword
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const storedData = otpStore.get(email);
  if (
    !storedData ||
    storedData.otp !== otp ||
    storedData.purpose !== "reset-password"
  ) {
    return res.status(400).json({ error: "Invalid or expired OTP." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  otpStore.delete(email);

  res.json({ message: "Password has been reset successfully." });
});

module.exports = router;
