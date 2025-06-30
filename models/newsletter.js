const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    emails: {
      type: [String],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    ctaText: {
      type: String,
      required: true,
    },
    ctaUrl: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    scheduleAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Newsletter", newsletterSchema);
