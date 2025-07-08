const mongoose = require("mongoose");

const AgmPageSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    content: String, // rich HTML
    image: {
      type: String, // URL or path to the image
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgmPage", AgmPageSchema);
