const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Video = require("../models/video");
// const JourneyTrackingService = require('../services/JourneyTracking');
const router = express.Router();

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Determine resource type based on fieldname and mimetype
      const isVideo = file.fieldname === "video";
      return {
        folder: isVideo ? "videos" : "thumbnails",
        resource_type: isVideo ? "video" : "image",
        // Add size limits appropriate for your application
        limits: isVideo ? { fileSize: 500 * 1024 * 1024 } : { fileSize: 5 * 1024 * 1024 }
      };
    },
  });
  const upload = multer({ 
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "video") {
        if (!file.mimetype.startsWith("video/")) {
          return cb(new Error("Only video files are allowed for video upload"), false);
        }
      } else if (file.fieldname === "thumbnail") {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed for thumbnail"), false);
        }
      }
      cb(null, true);
    }
  }).fields([
    { name: "thumbnail", maxCount: 1 }, 
    { name: "video", maxCount: 1 }
  ]);

// ============================
// 1️⃣ Upload Video
// ============================
router.post("/upload", (req, res, next) => {
    upload(req, res, function(err) {
      if (err) {
        console.error("Upload middleware error:", err);
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      next();
    });
  }, async (req, res) => {
    try {
      console.log("Handler started with body:", req.body);
      console.log("Files received:", req.files);
      
      const { title, description, type, category } = req.body;
      
      // Validate required fields
      if (!title || !description || !type || !category) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: { title, description, type, category } 
        });
      }
      
      // Validate files existence
      if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0] || 
          !req.files.video || !req.files.video[0]) {
        return res.status(400).json({ 
          message: "Both thumbnail and video files are required",
          filesReceived: req.files ? Object.keys(req.files) : "none"
        });
      }
      
      // Get file URLs
      const thumbnailUrl = req.files.thumbnail[0].path;
      const videoUrl = req.files.video[0].path;
      
      console.log("Creating new video with:", { 
        title, description, type, category, thumbnailUrl, videoUrl 
      });
      
      // Create and save video object
      const newVideo = new Video({
        title,
        description,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        type,
        category,
        views: 0,
        approved: false,
        uploadedBy: req.user ? req.user.id : null // If using authentication
      });
      
      const savedVideo = await newVideo.save();
      console.log("Video saved successfully:", savedVideo._id);
      
      res.status(201).json({ 
        message: "Video uploaded successfully, pending approval", 
        videoId: savedVideo._id 
      });
    } catch (error) {
      console.error("Upload handler error:", error);
      res.status(500).json({ 
        message: "Server error during video creation", 
        error: error.message 
      });
    }
  });
// ============================
// 2️⃣ Get Only Approved Videos
// ============================
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find({ approved: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/not", async (req, res) => {
  try {
    const videos = await Video.find({ approved: false }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 3️⃣ Approve a Video (Admin)
// ============================
router.put("/:id/approve", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video approved successfully", video });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 4️⃣ Update Video Views Count
// ============================
router.put("/:id/views", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Update Views Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 5️⃣ Delete a Video
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete Video Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/:id", async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Fetch Video by ID Error:", error);
      
      // Handle invalid ID format error
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid video ID format" });
      }
      
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
// ============================
// 4️⃣ Update Video Views Count
// ============================
router.put("/:id/views", async (req, res) => {
    try {
      const videoId = req.params.id;
      
      // Find the video and increment its views count
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        { $inc: { views: 1 } }, 
        { new: true } // This ensures we get the updated document back
      );
      
      // If no video found with that ID
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Return the updated video
      res.json(updatedVideo);
    } catch (error) {
      console.error("Update Views Error:", error);
      
      // Handle invalid ID format
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid video ID format" });
      }
      
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
module.exports = router;
