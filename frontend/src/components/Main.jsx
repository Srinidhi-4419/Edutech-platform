import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Thumbnail from './Thumbnail';
import { Search, Filter, Loader } from 'lucide-react';

const Main = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch all approved videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/videos');
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Explore Videos</h1>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-10">
          {/* Search bar - larger */}
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
          
          {/* Filter buttons - larger */}
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
          <h3 className="text-2xl font-medium text-gray-700 mb-3">No videos found</h3>
          <p className="text-lg text-gray-500">Try adjusting your search or filter</p>
        </div>
      )}
      
      {/* Videos grid - fewer columns for larger cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map(video => (
          <Thumbnail key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Main;