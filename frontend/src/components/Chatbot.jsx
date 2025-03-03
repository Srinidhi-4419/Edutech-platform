import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "What is the theory of relativity?",
    "Explain photosynthesis",
    "How do black holes work?",
    "What caused World War II?"
  ];

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Hide suggestions after first message
    setShowSuggestions(false);
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user', id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/transcription/ask-groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Based on your API structure, we need to extract the 'reply' field
      const botMessage = data.reply || 'No response content available';
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: botMessage, sender: 'bot', id: Date.now() + 1 }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'bot', 
        id: Date.now() + 1 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    // Focus on the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const bubbleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    exit: { scale: 0.8, opacity: 0 }
  };

  const typingIndicatorVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.5 } }
  };

  return (
    <motion.div 
      className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-xl overflow-hidden mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass Effect Header */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 backdrop-blur-md relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-white opacity-10 rounded-b-lg"></div>
        <div className="relative z-10">
          <motion.h2 
            className="text-xl font-bold text-white"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Educational AI Assistant
          </motion.h2>
          <motion.p 
            className="text-sm text-indigo-100 mt-1"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Powered by advanced machine learning
          </motion.p>
        </div>
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-2 right-4 flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </motion.div>
      </motion.div>
      
      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-gray-500"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key="empty-state"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                className="mb-6"
              >
                <svg className="w-24 h-24 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold text-indigo-700 mb-2"
                variants={messageVariants}
              >
                Welcome to your AI Assistant
              </motion.h3>
              <motion.p 
                className="text-gray-500 text-center max-w-sm mb-6"
                variants={messageVariants}
              >
                Ask me any educational question, and I'll provide a helpful answer!
              </motion.p>
              
              {showSuggestions && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md mt-2"
                  variants={containerVariants}
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-white border border-indigo-200 rounded-lg p-3 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                      variants={messageVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
              key="message-list"
            >
              {messages.map((message) => (
                <motion.div 
                  key={message.id} 
                  className={`${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                  variants={messageVariants}
                  layout
                >
                  <motion.div 
                    className={`p-3 rounded-2xl max-w-xs md:max-w-md lg:max-w-lg shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}
                    variants={bubbleVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="flex justify-start mt-4"
              variants={typingIndicatorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div className="bg-white p-3 rounded-2xl shadow-sm rounded-bl-none border border-gray-100">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-300"
                      variants={dotVariants}
                      initial="initial"
                      animate="animate"
                      custom={i * 0.15}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <motion.div 
        className="border-t border-gray-200 p-4 bg-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-end">
          <motion.div 
            className="flex-1 relative"
            whileTap={{ scale: 0.99 }}
          >
            <textarea 
              ref={inputRef}
              className="w-full border border-gray-300 p-3 pr-10 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50"
              placeholder="Ask an educational question..."
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {input.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
                onClick={() => setInput('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </motion.div>
          <motion.button 
            className={`px-4 py-3 rounded-r-xl font-medium ${
              input.trim() === '' || isLoading 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white transition-all shadow-md`}
            onClick={handleSend}
            disabled={input.trim() === '' || isLoading}
            whileHover={{ scale: input.trim() === '' || isLoading ? 1 : 1.05 }}
            whileTap={{ scale: input.trim() === '' || isLoading ? 1 : 0.95 }}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                initial={{ rotate: 0 }}
                animate={{ rotate: input.trim() === '' ? 0 : [0, 15, 0] }}
                transition={{ duration: 0.5, repeat: 0 }}
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </motion.svg>
            )}
          </motion.button>
        </div>
        
        {/* Features hint */}
        <motion.div 
          className="mt-2 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-gray-500">
            Press Enter to send • Try asking about physics, history, math & more
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Chatbot;