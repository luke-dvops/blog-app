const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
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

        // Check for MongoDB duplicate key error (code 11000)
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username is already in use. Please choose a new username." });
        }

        res.status(500).json(err);
    }
});



//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json({ error: "User not found!" })
        }
        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            return res.status(401).json({ error: "Wrong credentials!" })
        }
        const token = jwt.sign({ _id: user._id, username: user.username, email: user.email }, process.env.SECRET, { expiresIn: "3d" })
        const { password, ...info } = user._doc
        // Set the token in a cookie
        res.cookie("token", token, { httpOnly: true }).status(200).json(info);

        // Assuming 'token' is the name of the cookie
        const authToken = pm.response.cookies.token;
        
        // Set the authentication token as an environment variable
        pm.environment.set('authToken', authToken);
    }
    catch (err) {
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



module.exports = router
