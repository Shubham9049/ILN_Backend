// // sendWhatsAppMessage.js
// const twilio = require("twilio");
// require("dotenv").config();

// const accountSid = process.env.TWILIO_ACCOUNT_MSG_TOKEN;
// const authToken = process.env.TWILIO_AUTH_MSG_TOKEN;
// const client = twilio(accountSid, authToken);

// async function sendWelcomeMessage(userPhoneNumber) {
//   try {
//     client.messages.create({
//       body: "hi this is shubham kumar",
//       from: "+16313804790",
//       to: `${userPhoneNumber}`,
//     });

//     console.log("Message sent:", message.sid);
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//   }
// }

// module.exports = sendWelcomeMessage;
