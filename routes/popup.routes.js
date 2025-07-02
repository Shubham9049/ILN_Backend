const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Contact = require("../models/Contact.modal");

// POST /api/popup-lead
router.post("/popup-lead", async (req, res) => {
  const { fullName, phone, marketSegment, email } = req.body;

  if (!fullName || !phone || !marketSegment || !email) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const lead = new Lead({ fullName, phone, marketSegment, email });
    await lead.save();

    res.status(201).json({
      message: "Your request has been received. We’ll contact you shortly.",
    });
  } catch (error) {
    console.error("Error saving lead:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/popup-lead
router.get("/popup-lead", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: "Your message has been received!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// GET /api/contact
router.get("/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
