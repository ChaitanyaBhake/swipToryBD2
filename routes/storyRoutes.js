const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.js");
const {
  createStory,
  getStories,
  getStoryById,
  updateStory,
} = require("../controllers/story.js");
const { likeStory } = require("../controllers/like.js");


// public routes
router.get("/getAll", getStories);
router.get("/getById/:storyId", getStoryById);

//protected routes
router.post("/create", auth, createStory);
router.put("/update/:id", auth, updateStory);
router.put("/like/:id", auth, likeStory);

module.exports = router;
