import { useState } from 'react';
import { FaInstagram, FaUser, FaComments, FaUserPlus, FaPlus, FaSearch, FaUsers, FaCog, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import axios, { API_URL } from "../config/axios";
import SearchResults from './SearchResults';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, unreadMessages, onShowAccount }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    onShowAccount(true);
    setShowSettings(false);
  };

  return (
    <div className={`w-16 sm:w-64 h-[calc(100vh-57px)] border-r fixed ${
      isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
    }`}>
      <div className="flex flex-col p-2 h-full">
        <button 
          onClick={() => setActiveTab('newpost')}
          className="flex items-center space-x-2 p-3 rounded-lg bg-[#0095F6] text-white hover:bg-blue-600 w-full mb-4"
        >
          <FaPlus className="text-xl" />
          <span className="hidden sm:inline">New Post</span>
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
            ? 'text-dark-primary hover:bg-dark-primary' 
            : 'hover:bg-gray-100'
          } ${activeTab === 'feed' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
        >
          <FaInstagram className="text-xl" />
          <span className="hidden sm:inline">Feed</span>
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
            ? 'text-dark-primary hover:bg-dark-primary' 
            : 'hover:bg-gray-100'
          } ${activeTab === 'search' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
        >
          <FaSearch className="text-xl" />
          <span className="hidden sm:inline">Search</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
            ? 'text-dark-primary hover:bg-dark-primary' 
            : 'hover:bg-gray-100'
          } ${activeTab === 'profile' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
        >
          <FaUser className="text-xl" />
          <span className="hidden sm:inline">Profile</span>
        </button>
        <div className="relative">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`w-full flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
              ? 'text-dark-primary hover:bg-dark-primary' 
              : 'hover:bg-gray-100'
            } ${activeTab === 'friends' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
          >
            <FaUsers className="text-xl" />
            <span className="hidden sm:inline">Friends</span>
          </button>
          {unreadMessages > 0 && (
            <span className="absolute -top-1 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
              {unreadMessages}
            </span>
          )}
        </div>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex items-center space-x-2 p-3 rounded-lg mb-2 ${isDarkMode 
            ? 'text-dark-primary hover:bg-dark-primary' 
            : 'hover:bg-gray-100'
          } ${activeTab === 'requests' ? isDarkMode ? 'bg-dark-primary' : 'bg-gray-100' : ''}`}
        >
          <FaUserPlus className="text-xl" />
          <span className="hidden sm:inline">Requests</span>
        </button>
        <div className="relative">
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
                onClick={handleAccountClick}
                className={`w-full text-left px-4 py-3 flex items-center space-x-2 ${
                  isDarkMode ? 'hover:bg-gray-800 text-dark-primary' : 'hover:bg-gray-50'
                }`}
              >
                <FaUser className={isDarkMode ? 'text-dark-primary' : 'text-gray-700'} />
                <span>Account</span>
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
