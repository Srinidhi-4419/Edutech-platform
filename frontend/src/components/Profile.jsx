import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  // Simulate data loading for demo
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set some sample data - you can modify this to test empty states
        const processedData = {
          username: "learner123",
          joinDate: new Date().toISOString().split('T')[0],
          totalWatchTime: 150, // minutes
          videosWatched: 12,
          completionRate: 78,
          categoriesWatched: [
            { category: "Mathematics", count: 5, progress: 65 },
            { category: "Physics", count: 4, progress: 42 },
            { category: "Computer Science", count: 3, progress: 38 }
          ],
          watchHistory: [
            { videoTitle: "Introduction to Calculus", watchDate: "2024-10-18", percentCompleted: 100, category: "Mathematics" },
            { videoTitle: "Newton's Laws of Motion", watchDate: "2024-10-19", percentCompleted: 95, category: "Physics" }
          ]
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
  }, []);

  // Process data for charts
  const generateMonthlyData = () => {
    const monthlyData = {};
    
    userData.watchHistory.forEach(item => {
      const month = item.watchDate.split('-')[1];
      const monthName = new Date(`2024-${month}-01`).toLocaleString('default', { month: 'long' });
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { month: monthName, videos: 0, hours: 0 };
      }
      
      monthlyData[monthName].videos += 1;
      monthlyData[monthName].hours += (item.percentCompleted / 100) * 1;
    });
    
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
              <div className="flex items-center justify-center h-48 text-gray-500">
                No category data available yet
              </div>
            )}
          </div>
          
          {/* Monthly activity */}
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Monthly Activity</h2>
            {monthlyActivityData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No activity data available yet
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Categories tab */}
      {activeTab === 'categories' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Category Progress</h2>
          {userData.categoriesWatched && userData.categoriesWatched.length > 0 ? (
            <>
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
                      {userData.categoriesWatched.map((category, index) => (
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
                          <td className="p-3 border-b text-right">
                            {category.lastWatched ? new Date(category.lastWatched).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available yet
            </div>
          )}
        </div>
      )}
      
      {/* History tab */}
      {activeTab === 'history' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Watch History</h2>
          {userData.watchHistory && userData.watchHistory.length > 0 ? (
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
                  {userData.watchHistory.map((item, index) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No watch history available yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;