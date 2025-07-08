const express = require("express");
const router = express.Router();
const AgmPage = require("../models/agm.model");
const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

// 🔹 GET all AGM entries
router.get("/", async (req, res) => {
  try {
    const data = await AgmPage.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch AGM content" });
  }
});

// 🔹 POST new AGM content with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;

    const newAgm = new AgmPage({
      title,
      subtitle,
      content,
      image: req.file?.path || null, // ⬅️ set image URL from Cloudinary
    });

    const saved = await newAgm.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create AGM content" });
  }
});

// 🔹 PUT (Update) AGM content by ID with optional image update
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;

    const updateData = {
      title,
      subtitle,
      content,
    };

    if (req.file) {
      updateData.image = req.file.path; // ⬅️ update image if new one uploaded
    }

    const updated = await AgmPage.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update AGM content" });
  }
});

// 🔹 DELETE AGM content by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await AgmPage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "AGM content deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete AGM content" });
  }
});

module.exports = router;
