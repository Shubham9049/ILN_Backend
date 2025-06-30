const express = require("express");
const router = express.Router();
const enquirySchema = require("../models/chatbot.model");
const sendEmail = require("../utils/sendEmail");
// const OpenAI = require("openai");
require("dotenv").config();

// const openai = new OpenAI(process.env.OPENAI_API_KEY);

// const companyInfo = `
// **About Close Friends Traders**
// Close Friends Traders is a modern, community-driven trading platform providing expert support, strategy guidance, and real-time market assistance for retail and aspiring traders across India. We are committed to helping users navigate the financial markets with confidence and clarity.

// **Why Choose Us**
// - Experienced team with deep knowledge of Indian stock and derivatives markets
// - Transparent insights, practical strategies, and real-time trade ideas
// - Community-focused support with an emphasis on learning and collaboration
// - Always-available chatbot and access to live experts for advanced queries

// **Our Services**
// 1. **Equity & Derivatives**: Support for intraday and positional trading in NSE/BSE stocks, options, and futures.
// 2. **Commodity & Currency**: Trade with guidance in MCX commodities and forex markets.
// 3. **Trading Education**: Structured learning paths for beginners and intermediate traders.
// 4. **Live Market Support**: Real-time market updates, trade signals, and strategy tips during trading hours.
// 5. **Portfolio & Risk Advisory**: Help with capital allocation, risk control, and strategic planning.
// 6. **Community Access**: Join active Telegram and WhatsApp groups for daily insights, signals, and expert discussions.

// **Vision**
// To become India’s most trusted trading community by combining expert knowledge with personal support.

// **Who We Help**
// - Newcomers exploring the stock market
// - Active intraday and swing traders
// - Options and futures traders
// - Commodity market participants
// - Anyone seeking mentorship, trade setups, or market updates
// `;

// POST /api/prompt/submit
router.post("/enquiry", async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existing = await enquirySchema.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exist" });
    }

    const Enquiry = new enquirySchema({ name, phone, email, message });
    await Enquiry.save();
    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "📬 Thank You for Submitting Your Details",
      text: "We've received your information and will get back to you shortly.",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>✅ Details Received</h2>
      <p>Hi there,</p>
      <p>Thank you for submitting your details. We've received your information successfully.</p>
      <p>Our team will review your query and get in touch with you shortly.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 14px; color: #888;">If you didn't fill out a form recently, you can safely ignore this email.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `,
    });

    return res.status(200).json({ message: "Form submitted and saved." });
  } catch (error) {
    console.error("Error saving prompt:", error);
    return res.status(500).json({ error: "Failed to save form." });
  }
});

// const ChatbotModel = require("../models/chatbot.model");

// router.post("/chatbot", async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   try {
//     const prompt = `
// You are a helpful chatbot for Close Friends Traders, a trading education and support company based in India.
// Use the company details below to answer the user's question in a friendly, informative, and beginner-friendly way.
// If the question is unclear, guide the user to ask a trading-related query (like stock market tips, option strategy, or joining our community).

// Company Info:
// ${companyInfo}

// User Question: ${message}
// `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         { role: "system", content: "You are a helpful real estate assistant." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.7,
//     });

//     const reply =
//       response.choices[0].message.content.trim() ||
//       "Sorry, I couldn’t find an answer.";

//     // Save to DB
//     await ChatbotModel.create({
//       userMessage: message,
//       botReply: reply,
//     });

//     res.json({ reply });
//   } catch (error) {
//     console.error("Chatbot error:", error);
//     res.status(500).json({ error: "Something went wrong with the chatbot." });
//   }
// });

// router.get("/chatbot", async (req, res) => {
//   try {
//     const chats = await ChatbotModel.find().sort({ createdAt: -1 }); // latest first
//     res.json(chats);
//   } catch (error) {
//     console.error("Error fetching chat history:", error);
//     res.status(500).json({ error: "Failed to fetch chat history." });
//   }
// });

module.exports = router;
