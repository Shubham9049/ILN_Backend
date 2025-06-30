// models/Offer.js
const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    bannerImage: { type: String, required: true }, // hero section image
    popupImage: { type: String }, // optional modal image
    ctaLabel: { type: String, default: "Claim Now" },
    ctaLink: { type: String },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);
