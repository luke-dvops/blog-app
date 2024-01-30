const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcryptjs')
const Post=require('../models/Post')
const Comment=require('../models/Comment')
const verifyToken = require('../verifyToken')

//CREATE
router.post("/create",verifyToken,async (req,res)=>{
    try{
        const newComment=new Comment(req.body)
        const savedComment=await newComment.save()
        res.status(200).json(savedComment)
    }
    catch(err){
        res.status(500).json(err)
    }
     
})

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
    try {
      // Check if the update data contains an empty array for 'yourArrayField'
      if (Array.isArray(req.body.yourArrayField) && req.body.yourArrayField.length === 0) {
        return res.status(400).json({ error: 'Cannot update with an empty array.' });
      }
      const updatedComment = await Comment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      res.status(200).json(updatedComment);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//DELETE
router.delete("/:id",verifyToken,async (req,res)=>{
    try{
        await Comment.findByIdAndDelete(req.params.id)
        
        res.status(200).json("Comment has been deleted!")

    }
    catch(err){
        res.status(500).json(err)
    }
})

//GET POST COMMENTS
router.get("/post/:postId",async (req,res)=>{
  try{
      const comments=await Comment.find({postId:req.params.postId})
      res.status(200).json(comments)
  }
  catch(err){
      res.status(500).json(err)
  }
})

// GET a specific comment by ID
router.get("/:commentId", async (req, res) => {
  try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
      }
      res.status(200).json(comment);
  } catch (err) {
      res.status(500).json(err);
  }
});

module.exports = router;
