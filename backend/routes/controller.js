const UserJourney = require('../models/userjourney');
const Video = require('../models/video'); // Assuming you have a Video model
const mongoose = require('mongoose');

// Helper function to update category stats
const updateCategoryStats = async (userId, category) => {
  try {
    // Find all videos in this category
    const videos = await Video.find({ category });
    
    // Find all user's watch history for this category
    const userJourney = await UserJourney.findOne({ user: userId });
    
    if (!userJourney) return;
    
    const categoryVideosWatched = userJourney.watchHistory.filter(history => {
      // Need to populate video info to check category
      return history.video && history.video.category === category;
    });
    
    // Calculate category completion based on videos available vs watched
    const completedCount = categoryVideosWatched.filter(
      history => history.percentCompleted >= 90
    ).length;
    
    const categoryProgress = videos.length > 0 
      ? (completedCount / videos.length) * 100 
      : 0;
    
    // Update category stats
    const categoryIndex = userJourney.categoriesWatched.findIndex(
      cat => cat.category === category
    );
    
    if (categoryIndex !== -1) {
      userJourney.categoriesWatched[categoryIndex].count = completedCount;
      userJourney.categoriesWatched[categoryIndex].progress = categoryProgress;
    }
    
    await userJourney.save();
  } catch (err) {
    console.error('Error updating category stats:', err);
  }
};

// Get recommended videos based on user journey
exports.getRecommendedVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    // Get user journey
    const userJourney = await UserJourney.findOne({ user: userId });
    
    if (!userJourney || userJourney.watchHistory.length === 0) {
      // If no watch history, return popular videos
      const popularVideos = await Video.find({ approved: true })
        .sort({ views: -1 })
        .limit(10);
      
      return res.status(200).json(popularVideos);
    }
    
    // Find most watched category
    let favoriteCategory = null;
    let maxCount = 0;
    
    userJourney.categoriesWatched.forEach(category => {
      if (category.count > maxCount) {
        maxCount = category.count;
        favoriteCategory = category.category;
      }
    });
    
    // Get watched video IDs
    const watchedVideoIds = userJourney.watchHistory.map(
      history => history.video
    );
    
    // Find videos in favorite category that haven't been watched yet
    let recommendedVideos = [];
    
    if (favoriteCategory) {
      recommendedVideos = await Video.find({
        category: favoriteCategory,
        _id: { $nin: watchedVideoIds },
        approved: true
      }).limit(5);
    }
    
    // If not enough recommended videos, fill with popular videos
    if (recommendedVideos.length < 5) {
      const popularVideos = await Video.find({
        _id: { $nin: watchedVideoIds },
        approved: true
      })
        .sort({ views: -1 })
        .limit(5 - recommendedVideos.length);
      
      recommendedVideos = [...recommendedVideos, ...popularVideos];
    }
    
    return res.status(200).json(recommendedVideos);
  } catch (err) {
    console.error('Error getting recommended videos:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Add a new route to get recommendations
exports.getRecommendedVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    // Get user journey
    const userJourney = await UserJourney.findOne({ user: userId });
    
    if (!userJourney || userJourney.watchHistory.length === 0) {
      // If no watch history, return popular videos
      const popularVideos = await Video.find({ approved: true })
        .sort({ views: -1 })
        .limit(10);
      
      return res.status(200).json(popularVideos);
    }
    
    // Find most watched category
    let favoriteCategory = null;
    let maxCount = 0;
    
    userJourney.categoriesWatched.forEach(category => {
      if (category.count > maxCount) {
        maxCount = category.count;
        favoriteCategory = category.category;
      }
    });
    
    // Get watched video IDs
    const watchedVideoIds = userJourney.watchHistory.map(
      history => history.video
    );
    
    // Find videos in favorite category that haven't been watched yet
    let recommendedVideos = [];
    
    if (favoriteCategory) {
      recommendedVideos = await Video.find({
        category: favoriteCategory,
        _id: { $nin: watchedVideoIds },
        approved: true
      }).limit(5);
    }
    
    // If not enough recommended videos, fill with popular videos
    if (recommendedVideos.length < 5) {
      const popularVideos = await Video.find({
        _id: { $nin: watchedVideoIds },
        approved: true
      })
        .sort({ views: -1 })
        .limit(5 - recommendedVideos.length);
      
      recommendedVideos = [...recommendedVideos, ...popularVideos];
    }
    
    return res.status(200).json(recommendedVideos);
  } catch (err) {
    console.error('Error getting recommended videos:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = exports;