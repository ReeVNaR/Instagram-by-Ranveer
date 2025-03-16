import { useState, useEffect } from 'react';
import { FaUser, FaUserPlus } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';

const UserProfile = ({ userId, setSelectedImage, onStartChat }) => {
  const [profileData, setProfileData] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (profileData) {
      setIsFriend(profileData.isFriend);
    }
  }, [profileData]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      if (!res.data?.user) {
        throw new Error('User not found');
      }
      setProfileData(res.data);
      setRequestSent(res.data.requestSent);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await axios.post(`${API_URL}/friend-request/${userId}`);
      setRequestSent(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${isDarkMode ? 'text-dark-primary' : ''}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0095F6]"></div>
      </div>
    );
  }
  
  if (!profileData || !profileData.user) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDarkMode ? 'text-dark-primary' : ''}`}>
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold mb-2">User not found</h3>
        <p className="text-gray-500">This user may have been removed or is unavailable.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-57px)] ${isDarkMode ? 'text-dark-primary bg-dark-primary' : 'bg-gray-50'}`}>
      <div className={`max-w-4xl mx-auto px-2 sm:px-4 py-6`}>
        <div className={`rounded-lg p-6 sm:p-8 mb-8 ${
          isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0">
              {profileData.user.profilePic ? (
                <img 
                  src={profileData.user.profilePic} 
                  alt="Profile"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  isDarkMode ? 'bg-dark-primary' : 'bg-gray-200'
                }`}>
                  <FaUser className={`text-4xl ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <h2 className="text-xl font-semibold">{profileData.user.username}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  <div>
                    <span className="font-semibold">{profileData.user.friends?.length || 0}</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                      friends
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">{profileData.posts.length}</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                      posts
                    </span>
                  </div>
                  {isFriend && onStartChat && (
                    <button
                      onClick={() => onStartChat(profileData.user)}
                      className="px-4 py-2 bg-[#0095F6] text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Message
                    </button>
                  )}
                  {!isFriend && !requestSent && (
                    <button
                      onClick={handleSendRequest}
                      className="px-4 py-2 bg-[#0095F6] text-white rounded-lg text-sm hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <FaUserPlus />
                      <span>Send Request</span>
                    </button>
                  )}
                  {!isFriend && requestSent && (
                    <span className="text-gray-500 text-sm">Request Pending</span>
                  )}
                  {isFriend && (
                    <span className="text-green-500 font-medium flex items-center space-x-2">
                      <span>Friends</span>
                    </span>
                  )}
                </div>
              </div>
              {profileData.user.displayName && (
                <p className={`mt-2 sm:mt-4 ${isDarkMode ? 'text-dark-secondary' : 'text-gray-600'}`}>
                  {profileData.user.displayName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={`${
          isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white shadow-sm'
        } rounded-lg p-4 mb-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-primary' : ''}`}>
            Posts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profileData.user.isPrivate && !profileData.isFriend ? (
              <div className={`col-span-full py-8 text-center ${
                isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
              }`}>
                <p className="text-lg mb-2">This account is private</p>
                <p className="text-sm">Send friend request to see their posts</p>
              </div>
            ) : (
              profileData.posts.map((post) => (
                <div
                  key={post._id}
                  className={`relative aspect-square cursor-pointer overflow-hidden ${
                    isDarkMode ? 'bg-dark-primary' : 'bg-gray-100'
                  }`}
                  onClick={() => setSelectedImage(post)}
                >
                  <img
                    src={post.url}
                    alt=""
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
