const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
require('dotenv').config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
 // Replace with a secure secret key

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if all fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Storing password directly (not recommended in production)
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // 2. Verify password (Direct comparison as requested)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    // 3. Check if role matches
    if (user.role !== role) {
      return res.status(403).json({ message: "Unauthorized role" });
    }
    
    // 4. Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      {
        expiresIn: "1h",
      }
    );
    
    // 5. Return token and userId for localStorage as requested
    res.status(200).json({ 
      message: "Sign-in successful", 
      token,
      userId: user._id
    });
  } catch (error) {
    console.error("Sign-in Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
