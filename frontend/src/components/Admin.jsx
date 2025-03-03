import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Loader, CheckCircle, XCircle, Play, Eye, Calendar, Tag, X } from 'lucide-react';

const Admin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [processingIds, setProcessingIds] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); // Track selected video for preview

  // Fetch all videos (both approved and not approved)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Fetch unapproved videos by default
        const response = await axios.get('http://localhost:3000/api/videos/not');
        setVideos(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch videos. Please try again later.');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos based on search term and active filter
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || video.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique video types for filter buttons
  const videoTypes = ['All', ...new Set(videos.map(video => video.type))];

  // Handle approve video
  const handleApprove = async (id) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      await axios.put(`http://localhost:3000/api/videos/${id}/approve`);
      // Remove the approved video from the list
      setVideos(videos.filter(video => video._id !== id));
      // Close preview if this video was being previewed
      if (selectedVideo && selectedVideo._id === id) {
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Error approving video:', err);
      setError('Failed to approve video. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(videoId => videoId !== id));
    }
  };

  // Handle delete video
  const handleDelete = async (id) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      await axios.delete(`http://localhost:3000/api/videos/${id}`);
      // Remove the deleted video from the list
      setVideos(videos.filter(video => video._id !== id));
      // Close preview if this video was being previewed
      if (selectedVideo && selectedVideo._id === id) {
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(videoId => videoId !== id));
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString || Date.now()).toLocaleDateString(undefined, options);
  };

  // Handle opening video preview
  const handlePreviewVideo = (video) => {
    setSelectedVideo(video);
  };

  // Handle closing video preview
  const handleClosePreview = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Video Management</h1>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-10">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={22} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter buttons */}
          <div className="flex items-center space-x-3 overflow-x-auto py-2">
            <Filter size={22} className="text-gray-500 mr-3 flex-shrink-0" />
            {videoTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-6 py-3 rounded-full text-base font-medium transition-colors ${
                  activeFilter === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-80">
          <Loader size={50} className="text-blue-600 animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 mb-8 rounded-r-lg">
          <p className="text-lg">{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && filteredVideos.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-medium text-gray-700 mb-3">No pending videos found</h3>
          <p className="text-lg text-gray-500">All videos have been reviewed or try adjusting your search</p>
        </div>
      )}
      
      {/* Videos grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map(video => (
          <div key={video._id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Thumbnail with play button overlay */}
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handlePreviewVideo(video)}>
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center transform scale-75 hover:scale-100 transition-all duration-300">
                  <Play fill="white" size={24} className="text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white py-1 px-3 rounded-full text-sm">
                {video.type}
              </div>
            </div>
            
            {/* Video info */}
            <div className="p-5">
              <h3 className="font-bold text-xl mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{video.description}</p>
              
              {/* Category and views */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-xs">
                  <Tag size={14} className="mr-1 text-gray-500" />
                  <span className="bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded">
                    {video.category}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye size={16} className="mr-1" />
                  <span>{video.views} views</span>
                </div>
              </div>
              
              {/* Admin actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePreviewVideo(video)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  <Eye size={20} className="mr-2" />
                  Preview
                </button>
                <button 
                  onClick={() => handleApprove(video._id)}
                  disabled={processingIds.includes(video._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  {processingIds.includes(video._id) ? (
                    <Loader size={20} className="animate-spin mr-2" />
                  ) : (
                    <CheckCircle size={20} className="mr-2" />
                  )}
                  Approve
                </button>
                <button 
                  onClick={() => handleDelete(video._id)}
                  disabled={processingIds.includes(video._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  {processingIds.includes(video._id) ? (
                    <Loader size={20} className="animate-spin mr-2" />
                  ) : (
                    <XCircle size={20} className="mr-2" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Video Preview Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
              <button 
                onClick={handleClosePreview}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Video player */}
            <div className="flex-grow overflow-auto">
              <div className="aspect-video w-full bg-black">
                <video 
                  src={selectedVideo.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1" /> 
                        <span>{selectedVideo.views} views</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" /> 
                        <span>{formatDate(selectedVideo.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-1 text-gray-500" />
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {selectedVideo.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Admin actions in modal */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApprove(selectedVideo._id)}
                      disabled={processingIds.includes(selectedVideo._id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      {processingIds.includes(selectedVideo._id) ? (
                        <Loader size={20} className="animate-spin mr-2" />
                      ) : (
                        <CheckCircle size={20} className="mr-2" />
                      )}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedVideo._id)}
                      disabled={processingIds.includes(selectedVideo._id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      {processingIds.includes(selectedVideo._id) ? (
                        <Loader size={20} className="animate-spin mr-2" />
                      ) : (
                        <XCircle size={20} className="mr-2" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">{selectedVideo.description}</p>
                </div>
                
                {/* Additional video metadata could be displayed here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;