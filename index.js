const express = require("express");
const cors = require("cors");
const { connect } = require("./config/db");
const subscriberRoutes = require("./routes/subscriber.routes");
const popupLeadRoute = require("./routes/popup.routes");
const authRoutes = require("./routes/auth.routes");
// const ChatBot = require("./routes/enquiry.routes");
const BlogRoute = require("./routes/blog.routes");
const OfferROutes = require("./routes/offer.Routes");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/", subscriberRoutes);
app.use("/api", popupLeadRoute);
app.use("/api/auth", authRoutes);
// app.use("/api/enquiry", ChatBot);
app.use("/api/blogs", BlogRoute);
app.use("/api/offer", OfferROutes);

app.get("/", (req, res) => {
  res.send("API LIVE");
});

// Start server
app.listen(process.env.PORT, async () => {
  try {
    await connect();
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }

  console.log(`🚀 Server is listening on port ${process.env.PORT}`);
});

require("./newsletterScheduler");
