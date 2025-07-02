// controllers/newsfeedController.js
const Newsfeed = require("../models/newsfeed.model");

// Create News
exports.createNews = async (req, res) => {
  try {
    const { title, link, date } = req.body;
    const news = new Newsfeed({ title, link, date });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to create news item" });
  }
};

// Get All News
exports.getAllNews = async (req, res) => {
  try {
    const news = await Newsfeed.find().sort({ date: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch newsfeed" });
  }
};

// Update News
exports.updateNews = async (req, res) => {
  try {
    const updated = await Newsfeed.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "News not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update news item" });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    const deleted = await Newsfeed.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "News not found" });
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete news item" });
  }
};
