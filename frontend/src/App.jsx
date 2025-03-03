import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignIn } from '@clerk/clerk-react';
import SignUpComponent from './components/SignUpComponent';
import Navbar from './components/Navbar';
import Signin from './components/Signin';
import Create from './components/Create';
import Main from './components/Main';
import VideoDetail from './components/VideoDetail';
import Admin from './components/Admin';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';
// import Navbar from './Navbar';

function App() {
  // Replace with your actual publishable key from Clerk dashboard
  const clerkPubKey = "pk_test_YXB0LXB1Zy0xOS5jbGVyay5hY2NvdW50cy5kZXYk";
  
  return (
   
      <BrowserRouter>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<SignUpComponent />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<><Navbar /><Main/></>} />
          <Route path="/create" element={<Create />} />
          <Route path="/video/:id" element={<><Navbar/><VideoDetail/></>} />
          <Route path="/Profile" element={<><Navbar/><Profile/></>} />
          <Route path="/admindashboard" element={<><Navbar/><Admin/></>} />
          <Route path="/chatbot" element={<><Navbar/><Chatbot/></>} />


          
        </Routes>
      </BrowserRouter>
   
  );
}

export default App;