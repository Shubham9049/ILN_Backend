const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = "your_secret_key"; // Use process.env.JWT_SECRET in production

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "contactPerson email"
    );

    if (!user) return res.status(404).json({ error: "User not found." });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized. Token invalid." });
  }
};

module.exports = authenticateUser;
