const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");

const JWT_SECRET = "secretkey";

// MULTER SETUP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// UPLOAD PROFILE IMAGE (PROTECTED)
router.post("/upload-profile-image", verifyToken, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `${process.env.REACT_APP_API_URL}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      message: "Profile image updated successfully",
      profileImage: imageUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
});

module.exports = router;