const mongoose = require("mongoose");

const sentEmailerSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    ctaText: { type: String },
    ctaUrl: { type: String },
    imageUrl: { type: String },
    attachments: [
      {
        filename: String,
        path: String,
      },
    ],
    recipients: [String],
    sendToAll: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emailer", sentEmailerSchema);
