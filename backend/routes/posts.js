const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const verifyToken = require("../verifyToken");

//CREATE
router.post("/create", verifyToken, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    // console.log(req.body)
    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
