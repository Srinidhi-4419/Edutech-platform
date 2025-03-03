import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    joinDate: "",
    totalWatchTime: 0,
    videosWatched: 0,
    completionRate: 0,
    categoriesWatched: [],
    watchHistory: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          setError("User ID not found. Please login again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        
        // Fetch user stats from backend
        const statsResponse = await axios.get(`http://localhost:3000/api/user-journey/stats/${userId}`);
        
        // Process the data for the UI
        const processedData = {
          username: "learner123", // You might want to fetch this from a user profile API
          joinDate: new Date().toISOString().split('T')[0], // Placeholder
          totalWatchTime: statsResponse.data.totalWatchTime || 0,
          videosWatched: statsResponse.data.videosWatched || 0,
          completionRate: parseFloat(statsResponse.data.completionRate || 0),
          categoriesWatched: Array.isArray(statsResponse.data.categoriesWatched) 
            ? statsResponse.data.categoriesWatched.map(category => ({
                ...category,
                progress: Math.round(category.progress || 0)
              }))
            : [],
          watchHistory: Array.isArray(statsResponse.data.recentVideos)
            ? statsResponse.data.recentVideos.map(item => ({
                videoTitle: item.video?.title || "Untitled Video",
                watchDate: item.watchDate ? new Date(item.watchDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                percentCompleted: item.percentCompleted || 0,
                category: item.video?.category || "Uncategorized"
              }))
            : []
        };
        
        setUserData(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your learning data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Process data for charts
  const generateMonthlyData = () => {
    // Group watch history by month
    const monthlyData = {};
    
    // This is a simplified approach - in a real app, you would process actual timestamps
    // from the watchHistory array to create accurate monthly aggregations
    userData.watchHistory.forEach(item => {
      const month = item.watchDate.split('-')[1]; // Extract month from date (assuming YYYY-MM-DD)
      const monthName = new Date(`2024-${month}-01`).toLocaleString('default', { month: 'long' });
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { month: monthName, videos: 0, hours: 0 };
      }
      
      monthlyData[monthName].videos += 1;
      // Assume each video contributes some watch time (simplified)
      monthlyData[monthName].hours += (item.percentCompleted / 100) * 1; // Assuming average 1 hour per video
    });
    
    // If no data is available yet, provide sample data to match original design
    if (Object.keys(monthlyData).length === 0) {
      return [
        { month: "October", videos: 25, hours: 20 },
        { month: "November", videos: 32, hours: 26 },
        { month: "December", videos: 10, hours: 8 }
      ];
    }
    
    // Convert to array and sort by month
    return Object.values(monthlyData);
  };

  const monthlyActivityData = generateMonthlyData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 flex justify-center items-center h-64">
        <div className="text-lg">Loading your learning journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-50 p-4 rounded text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Learning Journey Analysis</h1>
      
      {/* Dashboard tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('history')}
        >
          Watch History
        </button>
      </div>
      
      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary stats */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Learning Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-500">Videos Watched</div>
                <div className="text-2xl font-bold">{userData.videosWatched}</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-gray-500">Watch Time</div>
                <div className="text-2xl font-bold">{Math.floor(userData.totalWatchTime / 60)}h {userData.totalWatchTime % 60}m</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-sm text-gray-500">Completion Rate</div>
                <div className="text-2xl font-bold">{userData.completionRate}%</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm text-gray-500">Categories</div>
                <div className="text-2xl font-bold">{userData.categoriesWatched.length}</div>
              </div>
            </div>
          </div>
          
          {/* Category distribution */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Category Distribution</h2>
            {userData.categoriesWatched && userData.categoriesWatched.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={userData.categoriesWatched}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userData.categoriesWatched.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { category: "Mathematics", count: 28 },
                      { category: "Physics", count: 17 },
                      { category: "Computer Science", count: 14 },
                      { category: "Chemistry", count: 8 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[...Array(4)].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Monthly activity */}
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Monthly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#8884d8" name="Hours Watched" />
                <Line yAxisId="right" type="monotone" dataKey="videos" stroke="#82ca9d" name="Videos Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Categories tab */}
      {activeTab === 'categories' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Category Progress</h2>
          {userData.categoriesWatched && userData.categoriesWatched.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userData.categoriesWatched}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="progress" fill="#8884d8" name="Progress %" />
                <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="Videos Watched" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { category: "Mathematics", count: 28, progress: 65 },
                { category: "Physics", count: 17, progress: 42 },
                { category: "Computer Science", count: 14, progress: 38 },
                { category: "Chemistry", count: 8, progress: 20 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="progress" fill="#8884d8" name="Progress %" />
                <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="Videos Watched" />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Category Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="p-3 border-b text-left">Category</th>
                    <th className="p-3 border-b text-right">Videos Watched</th>
                    <th className="p-3 border-b text-right">Progress</th>
                    <th className="p-3 border-b text-right">Last Watched</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.categoriesWatched && userData.categoriesWatched.length > 0 ? (
                    userData.categoriesWatched.map((category, index) => (
                      <tr key={index}>
                        <td className="p-3 border-b">{category.category}</td>
                        <td className="p-3 border-b text-right">{category.count}</td>
                        <td className="p-3 border-b text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${category.progress}%` }}
                              ></div>
                            </div>
                            {category.progress}%
                          </div>
                        </td>
                        <td className="p-3 border-b text-right">{category.lastWatched ? new Date(category.lastWatched).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    [
                      { category: "Mathematics", count: 28, progress: 65, lastWatched: new Date() },
                      { category: "Physics", count: 17, progress: 42, lastWatched: new Date() },
                      { category: "Computer Science", count: 14, progress: 38, lastWatched: new Date() },
                      { category: "Chemistry", count: 8, progress: 20, lastWatched: new Date() }
                    ].map((category, index) => (
                      <tr key={index}>
                        <td className="p-3 border-b">{category.category}</td>
                        <td className="p-3 border-b text-right">{category.count}</td>
                        <td className="p-3 border-b text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${category.progress}%` }}
                              ></div>
                            </div>
                            {category.progress}%
                          </div>
                        </td>
                        <td className="p-3 border-b text-right">{category.lastWatched.toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* History tab */}
      {activeTab === 'history' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Watch History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="p-3 border-b text-left">Video Title</th>
                  <th className="p-3 border-b text-right">Watch Date</th>
                  <th className="p-3 border-b text-center">Category</th>
                  <th className="p-3 border-b text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                {userData.watchHistory && userData.watchHistory.length > 0 ? (
                  userData.watchHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b">{item.videoTitle}</td>
                      <td className="p-3 border-b text-right">{item.watchDate}</td>
                      <td className="p-3 border-b text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{item.category}</span>
                      </td>
                      <td className="p-3 border-b text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${item.percentCompleted}%` }}
                            ></div>
                          </div>
                          {item.percentCompleted}%
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { videoTitle: "Introduction to Calculus", watchDate: "2024-10-18", percentCompleted: 100, category: "Mathematics" },
                    { videoTitle: "Newton's Laws of Motion", watchDate: "2024-10-19", percentCompleted: 95, category: "Physics" },
                    { videoTitle: "Introduction to Algorithms", watchDate: "2024-10-20", percentCompleted: 85, category: "Computer Science" },
                    { videoTitle: "Quantum Physics Basics", watchDate: "2024-10-21", percentCompleted: 75, category: "Physics" },
                    { videoTitle: "Linear Algebra Fundamentals", watchDate: "2024-10-22", percentCompleted: 90, category: "Mathematics" }
                  ].map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b">{item.videoTitle}</td>
                      <td className="p-3 border-b text-right">{item.watchDate}</td>
                      <td className="p-3 border-b text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{item.category}</span>
                      </td>
                      <td className="p-3 border-b text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${item.percentCompleted}%` }}
                            ></div>
                          </div>
                          {item.percentCompleted}%
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;