const express = require("express");
const router = express.Router();
const AgmPage = require("../models/agm.model");

// 🔹 GET all AGM entries
router.get("/", async (req, res) => {
  try {
    const data = await AgmPage.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch AGM content" });
  }
});

// 🔹 POST new AGM content
router.post("/", async (req, res) => {
  try {
    const newAgm = new AgmPage(req.body);
    const saved = await newAgm.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to create AGM content" });
  }
});

// 🔹 PUT (Update) AGM content by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await AgmPage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
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
