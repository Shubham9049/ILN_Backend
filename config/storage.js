const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs", // Optional folder name
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

module.exports = storage;
