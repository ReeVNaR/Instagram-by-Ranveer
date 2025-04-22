import { useState, useEffect, useRef } from 'react';
import { FaSmile, FaPaperPlane, FaChevronLeft, FaEllipsisV } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Chat = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.id);
    }
  }, []);

  useEffect(() => {
    if (friend?._id) {
      fetchMessages();
      // Mark messages as read when chat component mounts
      markMessagesAsRead();
    }
  }, [friend?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/${friend._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.get(`${API_URL}/messages/${friend._id}`);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/messages/${friend._id}`, {
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleBack = () => {
    try {
      navigate('/chat');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/chat';
    }
  };

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-600">Welcome to Chat</h3>
          <p className="text-gray-500 mt-2">Select a friend to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col fixed inset-x-0 top-[60px] bottom-[60px] ${
      isDarkMode ? 'bg-dark-primary' : 'bg-[#f0f2f5]'
    }`}>
      {/* Enhanced Header */}
      <div className={`sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b shadow-sm ${
        isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleBack}
            className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors ${
              isDarkMode ? 'text-dark-primary hover:bg-dark-hover' : 'text-gray-800'
            }`}
          >
            <FaChevronLeft className="text-lg" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {friend.profilePicture ? (
                <img 
                  src={friend.profilePic} 
                  alt={friend.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-xl ${
                  isDarkMode ? 'bg-dark-secondary text-dark-primary' : 'bg-gray-300 text-gray-600'
                }`}>
                  {friend.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className={`font-semibold text-sm md:text-base ${
                isDarkMode ? 'text-dark-primary' : 'text-gray-800'
              }`}>
                {friend.username}
              </h2>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
        </div>
        <button className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
          isDarkMode ? 'text-dark-primary hover:bg-dark-hover' : 'text-gray-600'
        }`}>
          <FaEllipsisV />
        </button>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2 min-h-full">
          {messages.map(message => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg ${
                message.sender._id === userId
                  ? isDarkMode ? 'bg-[#0095F6]' : 'bg-[#dcf8c6]'
                  : isDarkMode ? 'bg-dark-secondary' : 'bg-white'
              }`}>
                <p className={isDarkMode ? 'text-dark-primary' : 'text-gray-800'}>
                  {message.content}
                </p>
                <p className={`text-right text-xs mt-1 ${
                  isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Form */}
      <div className={`sticky bottom-0 border-t ${
        isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
      }`}>
        <form onSubmit={handleSend} className="px-3 py-3 md:px-4 flex items-center space-x-3 shadow-lg">
          <button
            type="button"
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
              isDarkMode ? 'text-dark-secondary hover:bg-dark-hover' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FaSmile className="text-xl text-gray-500 hover:text-gray-700" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className={`w-full px-4 py-2.5 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0095F6] transition-all ${
                isDarkMode 
                  ? 'bg-dark-primary text-white placeholder-gray-500' 
                  : 'bg-gray-100 text-gray-800 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                newMessage.trim() 
                  ? 'text-[#0095F6] hover:bg-gray-100' 
                  : 'text-gray-400'
              }`}
            >
              <FaPaperPlane className="text-lg" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
