const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserJourney = require('../models/userjourney');
const Video = require('../models/video'); // Assuming you have a Video model
const userJourneyController = require('./controller');

// Get recommended videos for a user
router.get('/recommended/:userId', userJourneyController.getRecommendedVideos);
// Update watch progress (called periodically during video playback)
router.post('/progress', async (req, res) => {
  try {
    const { videoId, watchDuration, percentCompleted, category, userId } = req.body;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ msg: 'Invalid video ID' });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    // Find or create user journey record
    let userJourney = await UserJourney.findOne({ user: userId });
    
    if (!userJourney) {
      userJourney = new UserJourney({
        user: userId,
        totalWatchTime: 0,
        videosWatched: 0,
        completionRate: 0,
        categoriesWatched: [],
        watchHistory: []
      });
    }

    // Check if this video already exists in watch history
    const existingHistoryIndex = userJourney.watchHistory.findIndex(
      history => history.video.toString() === videoId
    );

    const watchDate = new Date();

    if (existingHistoryIndex !== -1) {
      // Update existing history entry
      userJourney.watchHistory[existingHistoryIndex].percentCompleted = percentCompleted;
      userJourney.watchHistory[existingHistoryIndex].watchDuration = watchDuration;
      userJourney.watchHistory[existingHistoryIndex].watchDate = watchDate;
    } else {
      // Add new history entry
      userJourney.watchHistory.push({
        video: videoId,
        watchDate,
        percentCompleted,
        watchDuration
      });
    }

    // Check if this category exists in categoriesWatched
    const existingCategoryIndex = userJourney.categoriesWatched.findIndex(
      cat => cat.category === category
    );

    if (existingCategoryIndex !== -1) {
      // Update existing category
      userJourney.categoriesWatched[existingCategoryIndex].lastWatched = watchDate;
    } else {
      // Add new category
      userJourney.categoriesWatched.push({
        category,
        count: 1,
        progress: percentCompleted,
        lastWatched: watchDate
      });
    }

    userJourney.lastUpdated = watchDate;
    
    await userJourney.save();
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating watch progress:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// Complete video watch (called when video ends or user leaves)
router.post('/complete', async (req, res) => {
  try {
    const { videoId, watchDuration, percentCompleted, category, userId } = req.body;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ msg: 'Invalid video ID' });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    // Find or create user journey record
    let userJourney = await UserJourney.findOne({ user: userId });
    
    if (!userJourney) {
      userJourney = new UserJourney({
        user: userId,
        totalWatchTime: 0,
        videosWatched: 0,
        completionRate: 0,
        categoriesWatched: [],
        watchHistory: []
      });
    }

    // Check if this video already exists in watch history
    const existingHistoryIndex = userJourney.watchHistory.findIndex(
      history => history.video.toString() === videoId
    );

    const watchDate = new Date();
    const isNewVideo = existingHistoryIndex === -1;
    const isCompleted = percentCompleted >= 90; // Consider video completed if watched at least 90%

    // Update watch history
    if (existingHistoryIndex !== -1) {
      const prevCompletedStatus = userJourney.watchHistory[existingHistoryIndex].percentCompleted >= 90;
      
      // Update existing history entry
      userJourney.watchHistory[existingHistoryIndex].percentCompleted = percentCompleted;
      userJourney.watchHistory[existingHistoryIndex].watchDuration = watchDuration;
      userJourney.watchHistory[existingHistoryIndex].watchDate = watchDate;
      
      // If video wasn't completed before but is now, increment videosWatched
      if (!prevCompletedStatus && isCompleted) {
        userJourney.videosWatched += 1;
      }
    } else {
      // Add new history entry
      userJourney.watchHistory.push({
        video: videoId,
        watchDate,
        percentCompleted,
        watchDuration
      });
      
      // If new video is completed, increment videosWatched
      if (isCompleted) {
        userJourney.videosWatched += 1;
      }
    }

    // Convert watchDuration from seconds to minutes for totalWatchTime
    userJourney.totalWatchTime += watchDuration / 60;

    // Update categories watched
    const existingCategoryIndex = userJourney.categoriesWatched.findIndex(
      cat => cat.category === category
    );

    if (existingCategoryIndex !== -1) {
      // Update existing category
      userJourney.categoriesWatched[existingCategoryIndex].lastWatched = watchDate;
      
      // If it's a new completed video in this category, increment count
      if (isNewVideo && isCompleted) {
        userJourney.categoriesWatched[existingCategoryIndex].count += 1;
      }
      
      // Update progress (could be more sophisticated based on all videos in category)
      userJourney.categoriesWatched[existingCategoryIndex].progress = 
        (userJourney.categoriesWatched[existingCategoryIndex].progress + percentCompleted) / 2;
    } else {
      // Add new category
      userJourney.categoriesWatched.push({
        category,
        count: isCompleted ? 1 : 0,
        progress: percentCompleted,
        lastWatched: watchDate
      });
    }

    // Calculate overall completion rate
    if (userJourney.watchHistory.length > 0) {
      const totalCompletion = userJourney.watchHistory.reduce(
        (total, history) => total + history.percentCompleted, 0
      );
      userJourney.completionRate = totalCompletion / userJourney.watchHistory.length;
    }

    userJourney.lastUpdated = watchDate;
    
    await userJourney.save();
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error completing watch record:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// Get user journey stats
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    const userJourney = await UserJourney.findOne({ user: userId })
      .populate('watchHistory.video', 'title thumbnail category duration');
    
    if (!userJourney) {
      return res.status(200).json({
        totalWatchTime: 0,
        videosWatched: 0,
        completionRate: 0,
        categoriesWatched: [],
        recentVideos: []
      });
    }
    
    // Get 5 most recently watched videos
    const recentVideos = userJourney.watchHistory
      .sort((a, b) => b.watchDate - a.watchDate)
      .slice(0, 5);
    
    return res.status(200).json({
      totalWatchTime: Math.round(userJourney.totalWatchTime),
      videosWatched: userJourney.videosWatched,
      completionRate: userJourney.completionRate.toFixed(1),
      categoriesWatched: userJourney.categoriesWatched,
      recentVideos
    });
  } catch (err) {
    console.error('Error fetching user journey stats:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;