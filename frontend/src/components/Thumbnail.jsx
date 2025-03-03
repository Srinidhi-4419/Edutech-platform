import React from 'react';
import { Play, Eye, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Thumbnail = ({ video }) => {
  const navigate = useNavigate();
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate description to avoid overwhelming the card
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Handle click to navigate to video detail page
  const handleClick = () => {
    // Changed from /videos/ to /video/ to match VideoDetail component's route
    navigate(`/video/${video._id}`);
    
    // Optionally increment view count
  
  };

  return (
    <div 
      className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail with overlay */}
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play fill="white" size={24} className="text-white ml-1" />
          </div>
        </div>
        
        {/* Video type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full shadow-md">
            {video.type}
          </span>
        </div>
        
        {/* Views count */}
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center px-3 py-1 text-xs bg-black bg-opacity-70 text-white rounded-full">
            <Eye size={14} className="mr-1" /> {video.views.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{video.title}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {truncateText(video.description, 100)}
        </p>
        
        {/* Metadata footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(video.createdAt || new Date())}</span>
          </div>
          
          <div className="flex items-center">
            <Tag size={14} className="mr-1" />
            <span>{video.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thumbnail;