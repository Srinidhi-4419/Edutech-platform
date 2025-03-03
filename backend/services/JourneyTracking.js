const UserJourney = require('../models/userjourney');
const Video = require('../models/video'); // Assuming you have a Video model

/**
 * Service to handle user journey tracking and analysis
 */
class JourneyTrackingService {
  /**
   * Record a video watch event and update user journey metrics
   * @param {String} userId - User ID
   * @param {String} videoId - Video ID
   * @param {Number} percentCompleted - Percentage of video watched
   * @param {Number} watchDuration - Duration watched in seconds
   */
  static async recordWatchEvent(userId, videoId, percentCompleted, watchDuration) {
    try {
      // Get video data to access category information
      const video = await Video.findById(videoId);
      if (!video) throw new Error('Video not found');
      
      // Find or create user journey record
      let userJourney = await UserJourney.findOne({ user: userId });
      if (!userJourney) {
        userJourney = new UserJourney({ user: userId });
      }
      
      // Add to watch history
      userJourney.watchHistory.push({
        video: videoId,
        watchDate: Date.now(),
        percentCompleted,
        watchDuration
      });
      
      // Update watch statistics
      userJourney.updateWatchStats({ watchDuration, percentCompleted });
      
      // Update category data
      this.updateCategoryData(userJourney, video, percentCompleted);
      
      // Calculate overall completion rate
      this.calculateCompletionRate(userJourney);
      
      // Save all changes
      await userJourney.save();
      
      return userJourney;
    } catch (error) {
      console.error('Error recording watch event:', error);
      throw error;
    }
  }
  
  /**
   * Update category data based on watched video
   */
  static updateCategoryData(userJourney, video, percentCompleted) {
    const categoryIndex = userJourney.categoriesWatched.findIndex(
      cat => cat.category === video.category
    );
    
    if (categoryIndex >= 0) {
      // Category exists, update it
      userJourney.categoriesWatched[categoryIndex].count += 1;
      userJourney.categoriesWatched[categoryIndex].lastWatched = Date.now();
      
      // Only update progress if user watched a significant portion
      if (percentCompleted > 70) {
        // Simple progressive increase that slows down as progress gets higher
        const currentProgress = userJourney.categoriesWatched[categoryIndex].progress;
        const newProgress = Math.min(100, currentProgress + (100 - currentProgress) * 0.1);
        userJourney.categoriesWatched[categoryIndex].progress = newProgress;
      }
    } else {
      // New category, add it
      userJourney.categoriesWatched.push({
        category: video.category,
        count: 1,
        progress: percentCompleted > 70 ? 10 : 5, // Initial progress
        lastWatched: Date.now()
      });
    }
  }
  
  /**
   * Calculate overall completion rate
   */
  static calculateCompletionRate(userJourney) {
    if (!userJourney.watchHistory.length) return;
    
    const totalCompleted = userJourney.watchHistory.reduce((sum, item) => sum + item.percentCompleted, 0);
    userJourney.completionRate = Math.round(totalCompleted / userJourney.watchHistory.length);
  }
  
  /**
   * Get journey analysis data for display
   */
  static async getJourneyAnalysis(userId) {
    try {
      const userJourney = await UserJourney.findOne({ user: userId })
        .populate('watchHistory.video', 'title category duration');
      
      if (!userJourney) {
        return {
          totalWatchTime: 0,
          videosWatched: 0,
          completionRate: 0,
          categoriesWatched: [],
          watchHistory: []
        };
      }
      
      // Format watch history for display
      const formattedWatchHistory = userJourney.watchHistory.map(item => {
        return {
          videoTitle: item.video ? item.video.title : 'Unknown Video',
          watchDate: item.watchDate.toISOString().split('T')[0],
          percentCompleted: item.percentCompleted,
          category: item.video ? item.video.category : 'Uncategorized'
        };
      }).sort((a, b) => new Date(b.watchDate) - new Date(a.watchDate));
      
      return {
        totalWatchTime: userJourney.totalWatchTime,
        videosWatched: userJourney.videosWatched,
        completionRate: userJourney.completionRate,
        categoriesWatched: userJourney.categoriesWatched,
        watchHistory: formattedWatchHistory
      };
    } catch (error) {
      console.error('Error getting journey analysis:', error);
      throw error;
    }
  }
}

module.exports = JourneyTrackingService;