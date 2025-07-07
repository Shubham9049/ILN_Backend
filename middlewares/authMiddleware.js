// middleware/authenticateAdmin.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const JWT_SECRET = "your_secret_key"; // Use process.env.JWT_SECRET

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("email");

    if (!admin) return res.status(404).json({ error: "Admin not found." });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized. Token invalid." });
  }
};

module.exports = authenticateAdmin;
