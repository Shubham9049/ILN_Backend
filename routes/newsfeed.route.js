// routes/newsfeedRoutes.js
const express = require("express");
const router = express.Router();
const newsfeedController = require("../controller/newsfeed.controller");

// Create
router.post("/", newsfeedController.createNews);

// Read All
router.get("/", newsfeedController.getAllNews);

// Delete
router.delete("/:id", newsfeedController.deleteNews);

module.exports = router;
