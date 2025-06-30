const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    contactPerson: { type: String, required: true }, // Contact Person*
    companyName: { type: String, required: true }, // Company Name*
    designation: { type: String, required: true }, // Designation*
    companyAddress: { type: String, required: true }, // Company Address*
    email: { type: String, required: true, unique: true }, // E-mail Address*
    password: { type: String, required: true }, // Password*
    confirmPassword: { type: String, required: true }, // Confirm Password*
    isVerified: { type: Boolean, default: false }, // Optional: Tracks verification status
    otp: { type: String }, // Optional: stores current OTP
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
