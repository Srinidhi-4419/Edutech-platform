const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserJourneySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalWatchTime: {
    type: Number,
    default: 0,  // in minutes
    min: 0
  },
  videosWatched: {
    type: Number,
    default: 0,
    min: 0
  },
  completionRate: {
    type: Number,
    default: 0,  // percentage
    min: 0,
    max: 100
  },
  categoriesWatched: [{
    category: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,  // percentage of completion within category
      default: 0
    },
    lastWatched: {
      type: Date,
      default: Date.now
    }
  }],
  watchHistory: [{
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchDate: {
      type: Date,
      default: Date.now
    },
    percentCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    watchDuration: {
      type: Number,  // in seconds
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});




module.exports = mongoose.model('UserJourney', UserJourneySchema);