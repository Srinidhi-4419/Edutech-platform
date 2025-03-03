import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Eye, Calendar, Tag, ThumbsUp, Share2, Flag } from 'lucide-react';
import axios from 'axios';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs to keep track of video playback
  const videoRef = useRef(null);
  const watchStartTime = useRef(null);
  const watchDuration = useRef(0);
  const lastUpdateTime = useRef(null);
  const intervalRef = useRef(null);
  
  // Assume userId is stored in localStorage or session after login
  // In a real app, you might get this from a context or state management system
  const userId = localStorage.getItem('userId') || '65f1a2b3c4d5e6f7g8h9i0j1'; // Fallback to a placeholder ID

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/videos/${id}`);
        setVideo(response.data);
        document.title = response.data.title || 'Video Player';
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }

    return () => {
      document.title = 'Video Platform';
      // Save watch data when component unmounts
      saveWatchData();
      clearInterval(intervalRef.current);
    };
  }, [id]);

  // Calculate percent completed based on video's current time and duration
  const calculatePercentCompleted = () => {
    if (!videoRef.current) return 0;
    
    const { currentTime, duration } = videoRef.current;
    if (!duration) return 0;
    
    return Math.floor((currentTime / duration) * 100);
  };

  // Send periodic updates to the server about watch progress
  const startPeriodicUpdates = () => {
    // Update every 30 seconds
    intervalRef.current = setInterval(() => {
      if (isPlaying) {
        updateWatchProgress();
      }
    }, 30000); // 30 seconds
  };

  // Update watch progress
  const updateWatchProgress = async () => {
    if (!videoRef.current || !isPlaying) return;

    const now = Date.now();
    const elapsedSinceLastUpdate = lastUpdateTime.current ? 
      (now - lastUpdateTime.current) / 1000 : 0;
    
    // Only update if more than 5 seconds have passed since last update
    if (elapsedSinceLastUpdate < 5) return;

    watchDuration.current += elapsedSinceLastUpdate;
    lastUpdateTime.current = now;

    const percentCompleted = calculatePercentCompleted();

    try {
      await axios.post(`http://localhost:3000/api/user-journey/progress`, {
        videoId: id,
        watchDuration: Math.floor(watchDuration.current),
        percentCompleted,
        category: video.category,
        userId // Include userId in the request
      });
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };

  // Save watch data when video ends or component unmounts
  const saveWatchData = async () => {
    if (!videoRef.current || !id || !video) return;
    
    const percentCompleted = calculatePercentCompleted();
    
    try {
      await axios.post(`http://localhost:3000/api/user-journey/complete`, {
        videoId: id,
        watchDuration: Math.floor(watchDuration.current),
        percentCompleted,
        category: video.category,
        userId // Include userId in the request
      });
    } catch (err) {
      console.error('Error saving watch data:', err);
    }
  };

  const handleBack = () => {
    saveWatchData();
    navigate('/dashboard');
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    
    // Set watch start time if not already set
    if (!watchStartTime.current) {
      watchStartTime.current = Date.now();
      lastUpdateTime.current = Date.now();
    }
    
    // Start periodic updates
    if (!intervalRef.current) {
      startPeriodicUpdates();
    }
    
    // Increment view count
    fetch(`http://localhost:3000/api/videos/${id}/views`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => console.error('Error updating view count:', err));
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    
    // Update watch duration
    if (watchStartTime.current) {
      const now = Date.now();
      const elapsedSinceLastUpdate = (now - lastUpdateTime.current) / 1000;
      watchDuration.current += elapsedSinceLastUpdate;
      lastUpdateTime.current = now;
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    saveWatchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg">
          <p className="text-red-700 text-lg">{error || 'Video not found'}</p>
          <button 
            onClick={handleBack} 
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button 
        onClick={handleBack} 
        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to videos
      </button>

      {/* Video player section */}
      <div className="bg-black rounded-xl overflow-hidden shadow-xl mb-8">
        <div className="aspect-video w-full">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            poster={video.thumbnail}
            className="w-full h-full object-contain"
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Video details */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        {/* Title and primary info */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{video.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Eye size={18} className="mr-2" />
              <span>{video.views.toLocaleString()} views</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={18} className="mr-2" />
              <span>{formatDate(video.createdAt || new Date())}</span>
            </div>
            
            <div className="flex items-center">
              <Tag size={18} className="mr-2" />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {video.type}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
      
        
        {/* Divider */}
        <hr className="my-6 border-gray-200" />
        
        {/* Description section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
          <div className="text-gray-700 whitespace-pre-line">
            {video.description}
          </div>
        </div>
        
        {/* Additional details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Category</h3>
            <p className="text-gray-700">{video.category}</p>
          </div>
          
          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Status</h3>
            <p className="text-gray-700">
              {video.approved ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Approved
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending Approval
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;