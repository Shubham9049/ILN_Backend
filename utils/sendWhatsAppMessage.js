// sendWhatsAppMessage.js
const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendWelcomeMessage(userPhoneNumber) {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio Sandbox number for WhatsApp
      contentSid: process.env.CONTENT_SID, // Make sure this is a valid approved content template SID
      contentVariables: JSON.stringify({
        1: "👋 Welcome to close friends traders We’re excited to have you here 🎉",
      }),
      to: `whatsapp:${userPhoneNumber}`, // Format: whatsapp:+919XXXXXXXXX
    });

    console.log("✅ Message sent:", message.sid);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
  }
}

module.exports = sendWelcomeMessage;
