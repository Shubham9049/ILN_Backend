const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    legalStructure: {
      type: String,
      required: true,
    },
    establishmentDate: {
      type: Date,
      required: true,
    },
    building: {
      type: String,
    },
    street: {
      type: String,
    },
    area: {
      type: String,
    },
    landmark: {
      type: String,
    },
    poBox: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    memberId: {
      type: String,
      default: "",
    },
    businessVerticals: {
      type: [String], // Array of verticals like ['Logistics', 'Freight']
      default: [],
    },
    companyProfile: {
      type: String,
    },
    contactName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
    password: {
      type: String,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "", // or default logo image URL
    },
    website: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    keyMembers: [
      {
        name: { type: String },
        image: { type: String }, // Optional URL
        phone: { type: String },
        email: { type: String },
        role: { type: String },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
