const Offer = require("../models/Offer.model"); // make sure you’ve created models/Offer.js

exports.newOffer = async (req, res) => {
  try {
    const { title, subtitle, ctaLabel, ctaLink, startDate, endDate, isActive } =
      req.body;

    const bannerImage = req.files?.bannerImage?.[0]?.path;
    const popupImage = req.files?.popupImage?.[0]?.path || null;

    if (!title) {
      return res
        .status(400)
        .json({ error: "Title and banner image is required." });
    }

    // ✅ Convert values properly
    const offer = new Offer({
      title,
      subtitle,
      bannerImage,
      popupImage,
      ctaLabel,
      ctaLink,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive?.trim() === "true",
    });

    await offer.save();

    res.status(201).json({ message: "Offer created successfully.", offer });
  } catch (error) {
    console.error("Error saving offer:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.getOffer = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.OfferUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, ctaLabel, ctaLink, startDate, endDate, isActive } =
      req.body;

    const updateData = {
      title,
      subtitle,
      ctaLabel,
      ctaLink,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive === "true" || isActive === true,
    };

    if (req.files?.bannerImage?.[0]) {
      updateData.bannerImage = req.files.bannerImage[0].path;
    }
    if (req.files?.popupImage?.[0]) {
      updateData.popupImage = req.files.popupImage[0].path;
    }

    const updated = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update offer" });
  }
};

exports.OfferDelete = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found." });
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
