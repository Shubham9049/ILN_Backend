const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }, // Store hashed password!
});

module.exports = mongoose.model("Admin", adminSchema);
