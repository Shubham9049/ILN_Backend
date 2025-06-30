const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
    },
    botReply: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "chatbot_logs" }
);

module.exports = mongoose.model("Chatbot", chatbotSchema);
