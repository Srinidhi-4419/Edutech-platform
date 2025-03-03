const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String, // URL for thumbnail image
    required: true,
  },
  videoUrl: {
    type: String, // URL for video
    required: true,
  },
  type: {
    type: String,
    enum: ["Course", "Tutorial", "Lecture"], // Enum for type of video
    required: true,
  },
  category: {
    type: String, // Category of the video
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  approved: {
    type: Boolean,
    default: false, // Videos are not approved by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", VideoSchema);
module.exports = Video;
