const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if there is an existing user with the same username and email
        const existingUser = await User.findOne({ username, email });

        if (existingUser) {
            // If the combination of username and email is taken, return an error message
            return res.status(400).json({ error: "Username and email combination is already in use. Please choose a new combination." });
        }

        // If the combination of username and email is not in use, proceed with user registration
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        res.status(200).json(savedUser);
    } catch (err) {
        
        // Handle other types of errors or validation errors if needed
        res.status(500).json({ error: "Internal server error" });
    }
});




// LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) {
            return res.status(401).json({ error: "Wrong credentials!" });
        }

        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );
        
        const { password, ...info } = user._doc;
        
        res.cookie("token", token).status(200).json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//LOGOUT
router.get("/logout",async (req,res)=>{
    try{
        res.clearCookie("token",{sameSite:"none",secure:true}).status(200).send("User logged out successfully!")

    }
    catch(err){
        res.status(500).json(err)
    }
})



//REFETCH USER
router.get("/refetch", (req, res) => {
    const token = req.cookies.token
    jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
        if (err) {
            return res.status(404).json(err)
        }
        res.status(200).json(data)
    })
})


// CHECK USERNAME AVAILABILITY
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Check if the username exists in the database
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            // If the username is already in use, return an error message
            return res.status(200).json({ exists: true, message: "Username is already in use. Please choose a new username." });
        }

        // If the username is available, return a success message
        res.status(200).json({ exists: false, message: "Username is available." });
    } catch (err) {
        // Handle errors
        res.status(400).json({ error: err.message });
    }
  });

 

  // CHECK EMAIL AVAILABILITY
router.get('/check-email/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Check if the email exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // If the email is already in use, return an error message
            return res.status(200).json({ exists: true, message: "Email is already in use. Please use a different email address." });
        }

        // If the email is available, return a success message
        res.status(200).json({ exists: false, message: "Email is available." });
    } catch (err) {
        // Handle errors
        res.status(500).json({ error: err.message });
    }
});

module.exports = router
