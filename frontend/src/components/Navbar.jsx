import React, { useState, useEffect } from 'react';
import { LogOut, Video, Plus, Menu, X, User, MessageCircleQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Check for token and role in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setIsAdmin(role === 'admin');
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    // Show logout success toast
    toast.success('Logged out successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
    setShowProfileDropdown(false);
  };
  
  const handleCreateClick = () => {
    navigate('/create');
    setShowProfileDropdown(false);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };
  
  const navigateToProfile = () => {
    navigate('/Profile');
    setShowProfileDropdown(false);
  };

  const handleDoubtsClick = () => {
    navigate('/chatbot');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };
  
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };
  
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };
  
  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };
  
  const logoVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400 
      }
    }
  };
  
  return (
    <motion.nav 
      className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 shadow-xl"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      {/* ToastContainer for notifications */}
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Website Name and Logo */}
          <motion.div 
            className="flex items-center"
            variants={logoVariants}
            initial="rest"
            whileHover="hover"
          >
            <div 
              className="flex-shrink-0 cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              <h1 className="text-2xl font-bold text-white flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Video className="w-6 h-6 mr-2 text-blue-300" />
                </motion.div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 font-extrabold">
                  EduTech
                </span>
              </h1>
            </div>
          </motion.div>
          
          {/* Right - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Doubts button - Only show for non-admin users */}
                {!isAdmin && (
                  <motion.button 
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium rounded-lg transition-all shadow-md"
                    onClick={handleDoubtsClick}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <MessageCircleQuestion className="w-4 h-4 mr-2" />
                    Doubts
                  </motion.button>
                )}
                
                {/* Show Create button only for non-admin users */}
                {!isAdmin && (
                  <motion.button 
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium rounded-lg transition-all shadow-md"
                    onClick={handleCreateClick}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </motion.button>
                )}
                
                {/* Profile Icon - Only show dropdown for non-admin users */}
                <div className="relative profile-dropdown-container">
                  <motion.button 
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all flex items-center justify-center"
                    onClick={isAdmin ? handleLogout : handleProfileClick}
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      scale: 1.1
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAdmin ? (
                      <LogOut className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                  
                  {/* Profile Dropdown - Only for non-admin users */}
                  <AnimatePresence>
                    {showProfileDropdown && !isAdmin && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <motion.button 
                          className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left flex items-center"
                          onClick={navigateToProfile}
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                        >
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          Profile
                        </motion.button>
                        <motion.button 
                          className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left flex items-center"
                          onClick={handleLogout}
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                        >
                          <LogOut className="w-4 h-4 mr-2 text-red-500" />
                          Logout
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Doubts button for logged out users */}
                <motion.button 
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium rounded-lg transition-all shadow-md"
                  onClick={handleDoubtsClick}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <MessageCircleQuestion className="w-4 h-4 mr-2" />
                  Doubts
                </motion.button>
                
                <motion.button 
                  className="px-5 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-all"
                  onClick={() => navigate('/signin')}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign In
                </motion.button>
                <motion.button 
                  className="px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-lg transition-all shadow-md"
                  onClick={() => navigate('/signup')}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-200 focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-indigo-800/90 backdrop-blur-sm shadow-inner px-2 pt-2 pb-4 rounded-b-lg"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-3">
              {/* Mobile Auth Buttons */}
              <div className="space-y-2">
                {isLoggedIn ? (
                  <>
                    {/* Admin only sees logout option in mobile menu */}
                    {!isAdmin && (
                      <>
                        {/* Profile Option - Only for non-admin */}
                        <motion.button 
                          className="flex items-center w-full px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                          onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                          }}
                          variants={mobileItemVariants}
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </motion.button>
                        
                        {/* Doubts button - Only for non-admin */}
                        <motion.button 
                          className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium rounded-lg hover:from-amber-500 hover:to-amber-600 transition-colors"
                          onClick={handleDoubtsClick}
                          variants={mobileItemVariants}
                        >
                          <MessageCircleQuestion className="w-4 h-4 mr-2" />
                          Doubts
                        </motion.button>
                      
                        {/* Create button - Only for non-admin */}
                        <motion.button 
                          className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-emerald-600 transition-colors"
                          onClick={() => {
                            handleCreateClick();
                            setIsMobileMenuOpen(false);
                          }}
                          variants={mobileItemVariants}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create
                        </motion.button>
                      </>
                    )}
                    <motion.button 
                      className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-medium rounded-lg hover:from-red-500 hover:to-red-600 transition-colors"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      variants={mobileItemVariants}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Doubts button for logged out users */}
                    <motion.button 
                      className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium rounded-lg hover:from-amber-500 hover:to-amber-600 transition-colors"
                      onClick={handleDoubtsClick}
                      variants={mobileItemVariants}
                    >
                      <MessageCircleQuestion className="w-4 h-4 mr-2" />
                      Doubts
                    </motion.button>
                    
                    <motion.button 
                      className="w-full px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => {
                        navigate('/signin');
                        setIsMobileMenuOpen(false);
                      }}
                      variants={mobileItemVariants}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      Sign In
                    </motion.button>
                    <motion.button 
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-600 transition-colors"
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      variants={mobileItemVariants}
                    >
                      Sign Up
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;