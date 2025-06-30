const router = require("express").Router();
const {
  newBlogPost,
  getBlog,
  updateBlogPostBySlug,
  deleteBlogPostBySlug,
} = require("../controller/Blog.controller");
const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

router.post("/add", upload.single("coverImage"), newBlogPost);
router.get("/viewblog", getBlog);
router.put("/:slug", upload.single("coverImage"), updateBlogPostBySlug);
router.delete("/:slug", deleteBlogPostBySlug);

module.exports = router;
