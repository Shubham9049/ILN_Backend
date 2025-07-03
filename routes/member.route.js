const express = require("express");
const router = express.Router();
const Member = require("../models/member.model");

// POST: Create new member
router.post("/", async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json({ message: "Member registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate email
      return res.status(409).json({ error: "Email already exists." });
    }
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err.message });
  }
});

// GET: Get all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members." });
  }
});

module.exports = router;
