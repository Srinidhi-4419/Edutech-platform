import React, { useState } from 'react';
import { Upload, Video, X, Check, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { updateCategoryData } from '../../../backend/services/JourneyTracking';

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '', // Will be a dropdown with predefined values
    category: '' // New field required by the backend
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [video, setVideo] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Predefined video types from backend
  const videoTypes = ["Course", "Tutorial", "Lecture"];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setVideoName(file.name);
    }
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview('');
  };

  // Remove video
  const removeVideo = () => {
    setVideo(null);
    setVideoName('');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.type) {
      setError('Video type is required');
      return;
    }
    
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    
    if (!thumbnail) {
      setError('Thumbnail is required');
      return;
    }
    
    if (!video) {
      setError('Video file is required');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    // Create FormData for multipart/form-data submission
    const uploadData = new FormData();
    uploadData.append('title', formData.title.toString());
    uploadData.append('description', formData.description.toString());
    uploadData.append('type', formData.type.toString());
    uploadData.append('category', formData.category.toString());
    
    
    // Make sure fieldnames match exactly what the server expects
    uploadData.append('thumbnail', thumbnail);
    uploadData.append('video', video);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to upload videos');
        setIsUploading(false);
        return;
      }
      
      // Log FormData entries for debugging (optional)
      for (let pair of uploadData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await axios.post('http://localhost:3000/api/videos/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success toast notification
      toast.success('Video uploaded successfully! It will be available after approval.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      setIsUploading(false);
      
      // Reset form after successful upload
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      setIsUploading(false);
      console.error('Upload error:', error);
      
      // Better error handling
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Error uploading video. Please try again.');
      } else {
        setError('Network error or server unavailable. Please try again later.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <ToastContainer />
      
      <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center">
        <Video className="w-8 h-8 mr-2" />
        Upload New Video
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Video Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a descriptive title for your video"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide a detailed description of your video content"
          ></textarea>
        </div>
        
        {/* Video Type - Dropdown */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Video Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" disabled>Select a video type</option>
            {videoTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select the type of content you're uploading
          </p>
        </div>
        
        {/* Category - New field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Programming, Business, Arts, etc."
          />
          <p className="mt-1 text-xs text-gray-500">
            Specify a category for your video to help with classification
          </p>
        </div>
        
        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image *
          </label>
          
          {!thumbnailPreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG or JPEG (Max 5MB)</p>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Select Thumbnail
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleThumbnailChange}
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                className="h-48 w-full object-cover rounded-lg" 
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File *
          </label>
          
          {!videoName ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
              <Video className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-4">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mb-4">MP4, WebM, MOV (Max 500MB)</p>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Select Video
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="video/mp4, video/webm, video/quicktime"
                  onChange={handleVideoChange}
                />
              </label>
            </div>
          ) : (
            <div className="relative bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Video className="w-6 h-6 text-blue-500 mr-3" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-800 truncate">{videoName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create;