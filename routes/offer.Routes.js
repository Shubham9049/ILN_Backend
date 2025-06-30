const router = require("express").Router();
const {
  newOffer,
  getOffer,
  OfferUpdate,
  OfferDelete,
} = require("../controller/Offer.controller");
const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

// POST /api/offers/add → Add new offer (with Cloudinary image upload)
router.post(
  "/add",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "popupImage", maxCount: 1 },
  ]),
  newOffer
);

// GET /api/offers/view → Fetch all active offers
router.get("/view", getOffer);

// PUT /api/offers/:id → Update offer (optionally with image)
router.put(
  "/:id",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "popupImage", maxCount: 1 },
  ]),
  OfferUpdate
);

// DELETE /api/offers/:id → Delete offer
router.delete("/:id", OfferDelete);

module.exports = router;
