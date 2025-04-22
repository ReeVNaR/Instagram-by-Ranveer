import { useState, useEffect } from 'react';
import { FaInstagram, FaUser, FaComments, FaUserPlus, FaPlus, FaSearch, FaUsers, FaCog, FaMoon, FaSun, FaLock } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import axios, { API_URL } from "../config/axios";
import SearchResults from './SearchResults';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, unreadMessages, onShowAccount, isPrivate, togglePrivacy }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/friend-requests`);
        setFriendRequests(res.data);
      } catch (err) {
        console.error('Error fetching friend requests:', err);
      }
    };

    fetchFriendRequests();
    const interval = setInterval(fetchFriendRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccountClick = () => {
    onShowAccount(true);
    setShowSettings(false);
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 h-16 sm:h-[calc(100vh-57px)] 
      sm:w-64 border-t sm:border-t-0 sm:border-r 
      flex sm:flex-col 
      ${isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'}
      z-50 sm:left-0 sm:top-[57px]
    `}>
      <div className="flex sm:flex-col p-2 h-full w-full justify-around sm:justify-start">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col sm:flex-row items-center sm:space-x-2 p-1 sm:p-3 rounded-lg 
            ${isDarkMode ? 'text-dark-primary hover:bg-dark-primary' : 'hover:bg-gray-100'}
            ${activeTab === 'feed' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}
          `}
        >
          <FaInstagram className="text-xl" />
          <span className="text-xs sm:text-base sm:inline">Feed</span>
        </button>

        <button 
          onClick={() => setActiveTab('search')}
          className={`flex flex-col sm:flex-row items-center sm:space-x-2 p-1 sm:p-3 rounded-lg
            ${isDarkMode ? 'text-dark-primary hover:bg-dark-primary' : 'hover:bg-gray-100'}
            ${activeTab === 'search' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}
          `}
        >
          <FaSearch className="text-xl" />
          <span className="text-xs sm:text-base sm:inline">Search</span>
        </button>

        <button 
          onClick={() => setActiveTab('newpost')}
          className={`flex flex-col sm:flex-row items-center sm:space-x-2 p-1 sm:p-3 rounded-lg
            ${isDarkMode ? 'text-dark-primary hover:bg-dark-primary' : 'hover:bg-gray-100'}
          `}
        >
          <FaPlus className="text-xl" />
          <span className="text-xs sm:text-base sm:inline">Post</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col sm:flex-row items-center sm:space-x-2 p-1 sm:p-3 rounded-lg
            ${isDarkMode ? 'text-dark-primary hover:bg-dark-primary' : 'hover:bg-gray-100'}
            ${activeTab === 'profile' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}
          `}
        >
          <FaUser className="text-xl" />
          <span className="text-xs sm:text-base sm:inline">Profile</span>
        </button>

        <button 
          onClick={() => setActiveTab('requests')}
          className={`hidden sm:flex items-center space-x-2 p-3 rounded-lg relative ${
            isDarkMode ? 'text-dark-primary hover:bg-dark-primary' : 'hover:bg-gray-100'
          } ${activeTab === 'requests' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
        >
          <div className="relative">
            <FaUserPlus className="text-xl" />
            {friendRequests.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">{friendRequests.length}</span>
              </div>
            )}
          </div>
          <span className="hidden sm:inline">Friend Requests</span>
        </button>

        {/* Settings button - Only show on desktop */}
        <div className="hidden sm:block">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
              ? 'text-dark-primary hover:bg-dark-primary' 
              : 'hover:bg-gray-100'
            } ${showSettings ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
          >
            <FaCog className={`text-xl transition-transform duration-200 ${showSettings ? 'rotate-45' : ''}`} />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {showSettings && (
            <div className={`absolute top-0 left-full ml-2 w-48 rounded-lg shadow-lg border overflow-hidden ${
              isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
            }`}>
              <button
                onClick={() => {
                  togglePrivacy();
                  setShowSettings(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                  isDarkMode ? 'hover:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaLock className={`${isDarkMode ? 'text-dark-primary' : 'text-gray-700'}`} />
                  <span className={isDarkMode ? 'text-dark-primary' : ''}>Private Account</span>
                </div>
                <div className="relative">
                  <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    isPrivate 
                      ? 'bg-[#0095F6]' 
                      : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                      isPrivate ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  toggleTheme();
                  setShowSettings(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center space-x-2 ${
                  isDarkMode ? 'hover:bg-gray-800 text-dark-primary' : 'hover:bg-gray-50'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <FaSun className="text-yellow-500" />
                    <span>Light Theme</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="text-gray-700" />
                    <span>Dark Theme</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
