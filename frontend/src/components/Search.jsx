import { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaTimes, FaArrowLeft, FaLock } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import UserProfile from './UserProfile';
import { useTheme } from '../context/ThemeContext';

const Search = ({ onUserSelect, selectedUserId, onBack }) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.id);
    }
    fetchRecentSearches();
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const res = await axios.get(`${API_URL}/recent-searches`);
      setRecentSearches(res.data);
    } catch (err) {
      console.error('Error fetching recent searches:', err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/search?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    if (user._id === currentUserId) {
      alert("This is your profile");
      return;
    }
    try {
      await axios.post(`${API_URL}/recent-searches`, { searchedUserId: user._id });
      await fetchRecentSearches();
      onUserSelect(user._id);
    } catch (err) {
      console.error('Error recording search:', err);
      onUserSelect(user._id);
    }
  };

  const removeRecentSearch = async (e, userId) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/recent-searches/${userId}`);
      await fetchRecentSearches();
    } catch (err) {
      console.error('Error removing recent search:', err);
    }
  };

  const renderUserItem = (user) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
          {user.profilePic ? (
            <img 
              src={user.profilePic} 
              alt={user.username}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="text-gray-400 text-xl" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-medium truncate">{user.username}</p>
            {user.isPrivate && (
              <FaLock className="text-sm text-gray-500 flex-shrink-0" />
            )}
          </div>
          {user.displayName && (
            <p className="text-sm text-gray-500 truncate">{user.displayName}</p>
          )}
        </div>
      </div>
      <button
        onClick={(e) => removeRecentSearch(e, user._id)}
        className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <FaTimes />
      </button>
    </div>
  );

  if (selectedUserId) {
    return (
      <div className={`min-h-screen sm:min-h-0 sm:rounded-lg ${
        isDarkMode ? 'bg-dark-secondary' : 'bg-white'
      }`}>
        <div className={`sticky top-0 z-10 border-b p-4 ${
          isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
        }`}>
          <button
            onClick={onBack}
            className="text-[#0095F6] hover:text-blue-700 flex items-center space-x-2"
          >
            <FaArrowLeft className="text-xl" />
            <span>Back</span>
          </button>
        </div>
        <UserProfile userId={selectedUserId} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`min-h-screen sm:min-h-0 sm:rounded-lg p-4 ${
        isDarkMode ? 'bg-dark-secondary' : 'bg-white'
      }`}>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className={`w-full p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095F6] ${
              isDarkMode 
                ? 'bg-dark-primary border-dark-border text-dark-primary placeholder-gray-500'
                : 'border bg-white'
            }`}
          />
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-t-2 border-[#0095F6] rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {!searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className={`text-base font-semibold ${
                isDarkMode ? 'text-dark-primary' : ''
              }`}>Recent</h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await axios.delete(`${API_URL}/recent-searches`);
                      setRecentSearches([]);
                    } catch (err) {
                      console.error('Error clearing recent searches:', err);
                    }
                  }}
                  className="text-sm text-[#0095F6] hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-dark-border' : ''}`}>
              {recentSearches.map(user => (
                <div 
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={`flex items-center justify-between py-3 cursor-pointer ${
                    isDarkMode ? 'hover:bg-dark-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  {renderUserItem(user)}
                </div>
              ))}
              {recentSearches.length === 0 && (
                <p className={`text-center py-4 ${
                  isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
                }`}>No recent searches</p>
              )}
            </div>
          </div>
        )}

        {searchQuery && (
          <div className={`divide-y ${isDarkMode ? 'divide-dark-border' : ''}`}>
            {searchResults.map(user => (
              <div 
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center space-x-3 py-3 cursor-pointer ${
                  isDarkMode ? 'hover:bg-dark-primary' : 'hover:bg-gray-50'
                }`}
              >
                {renderUserItem(user)}
              </div>
            ))}
            {searchQuery && !searchResults.length && !isLoading && (
              <p className={`text-center py-4 ${
                isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
              }`}>No users found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
