import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaSignOutAlt, FaArrowLeft, FaUser, FaComments, FaUserPlus } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import ImageModal from "../components/ImageModal";
import Feed from "../components/Feed";
import Profile from "../components/Profile";
import NewPost from "../components/NewPost";
import Sidebar from "../components/Sidebar";
import Search from "../components/Search";
import UserProfile from "../components/UserProfile";
import Requests from '../components/Requests';
import ChatList from '../components/ChatList';
import Chat from '../components/Chat';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [feedPosts, setFeedPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedChatFriend, setSelectedChatFriend] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showAccount, setShowAccount] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    // Check for token existence
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Verify token hasn't expired
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
        return;
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/feed`);
      setFeedPosts(res.data);
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'profile') {
      fetchProfile();
    } else {
      fetchImages();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate('/login');  // Changed from '/' to '/login'
  };

  const fetchImages = async () => {
    if (!localStorage.getItem('token')) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${API_URL}/images`);
      setImages(res.data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.error || 'Failed to load images');
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Select an image first!");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData);
      await fetchImages();
      setImage(null);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPost = async (formData) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/upload`, formData);
      setImage(null);
      setCaption("");
      setShowNewPost(false);
      fetchFeed();
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`${API_URL}/images/${imageId}`);
      fetchImages();
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/profile`);
      setProfileData(res.data);
      setNewDisplayName(res.data.user.displayName || '');
      setIsPrivate(res.data.user.isPrivate); // Add this line
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(); // Add this line to fetch initial profile data including privacy status
  }, []);

  const updateDisplayName = async () => {
    try {
      const res = await axios.put(`${API_URL}/profile`, { displayName: newDisplayName });
      setProfileData(prev => ({ ...prev, user: res.data }));
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleProfilePicUpdate = async () => {
    if (!profilePic) return;
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("image", profilePic);
  
    try {
      const res = await axios.post(`${API_URL}/profile/picture`, formData);
      setProfileData(prev => ({ ...prev, user: res.data }));
      setProfilePic(null);
    } catch (err) {
      alert("Failed to update profile picture");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(`${API_URL}/profile`, { displayName: newDisplayName });
      setProfileData(prev => ({ ...prev, user: res.data }));
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleFriendSelect = (friend) => {
    setSelectedChatFriend(friend);
    setActiveTab('friends');
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/unread/count`);
      setUnreadMessages(res.data.count);
    } catch (err) {
      console.error('Error fetching unread messages:', err);
    }
  };

  const togglePrivacy = async () => {
    try {
      const res = await axios.put(`${API_URL}/profile/privacy`);
      setIsPrivate(res.data.isPrivate);
    } catch (err) {
      console.error('Error toggling privacy:', err);
    }
  };

  useEffect(() => {
    fetchUnreadMessages(); // Initial fetch

    if (activeTab === 'friends') {
      setUnreadMessages(0); // Reset when viewing friends tab
    } else {
      const interval = setInterval(fetchUnreadMessages, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshStatus('Checking for updates...');
    
    try {
      let hasUpdates = false;
      
      if (activeTab === 'feed') {
        const res = await axios.get(`${API_URL}/feed`);
        if (JSON.stringify(res.data) !== JSON.stringify(feedPosts)) {
          setFeedPosts(res.data);
          hasUpdates = true;
        }
      } else if (activeTab === 'profile') {
        const res = await axios.get(`${API_URL}/profile`);
        if (JSON.stringify(res.data) !== JSON.stringify(profileData)) {
          setProfileData(res.data);
          hasUpdates = true;
        }
      }

      // Check for new messages
      const msgRes = await axios.get(`${API_URL}/messages/unread/count`);
      if (msgRes.data.count > unreadMessages) {
        setUnreadMessages(msgRes.data.count);
        hasUpdates = true;
      }

      // Check for new friend requests
      const reqRes = await axios.get(`${API_URL}/friend-requests`);
      if (reqRes.data.length > 0) {
        hasUpdates = true;
      }

      setRefreshStatus(hasUpdates ? 'Updated successfully!' : 'Everything is up to date');
      setTimeout(() => setRefreshStatus(''), 2000); // Clear status after 2 seconds
    } catch (err) {
      setRefreshStatus('Error refreshing data');
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Handle page refresh
    const handlePageRefresh = () => {
      handleRefresh();
    };

    window.addEventListener('focus', handlePageRefresh);
    return () => window.removeEventListener('focus', handlePageRefresh);
  }, [activeTab, feedPosts, profileData, unreadMessages]);

  // Add this new effect to handle browser refresh
  useEffect(() => {
    const handleBrowserRefresh = (e) => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleBrowserRefresh);
    return () => window.removeEventListener('keydown', handleBrowserRefresh);
  }, [activeTab, feedPosts, profileData, unreadMessages]);

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
    const interval = setInterval(fetchFriendRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRequest = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/friend-requests/${requestId}`, { status });
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      if (status === 'accepted') {
        // Refresh user data or friend list if needed
      }
    } catch (err) {
      console.error('Error handling friend request:', err);
    }
  };

  const handleMessagesClick = () => {
    setActiveTab('friends');
    setSelectedChatFriend(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <Search 
            onUserSelect={setSelectedUserId}
            selectedUserId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
          />
        );
      case 'feed':
        return <Feed feedPosts={feedPosts} setSelectedImage={setSelectedImage} setFeedPosts={setFeedPosts} />;
      case 'profile':
        return (
          <Profile 
            profileData={profileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            newDisplayName={newDisplayName}
            setNewDisplayName={setNewDisplayName}
            handleSaveProfile={handleSaveProfile}
            handleProfilePicUpdate={handleProfilePicUpdate}
            setProfilePic={setProfilePic}
            setSelectedImage={setSelectedImage}
            handleDelete={handleDelete}  // Add this line
            isPrivate={isPrivate}
            togglePrivacy={togglePrivacy}
          />
        );
      case 'newpost':
        return (
          <NewPost 
            image={image}
            setImage={setImage}
            caption={caption}
            setCaption={setCaption}
            handleNewPost={handleNewPost}
            isLoading={isLoading}
          />
        );
      case 'requests':
        return <Requests />;
      case 'chats':
        return (
          <div className="bg-white rounded-lg overflow-hidden flex">
            <ChatList onSelectFriend={setSelectedFriend} selectedFriend={selectedFriend} />
            <Chat friend={selectedFriend} />
          </div>
        );
      case 'friends':
        return (
          <div className={`${isDarkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-lg overflow-hidden min-h-[calc(100vh-12rem)]`}>
            {selectedChatFriend ? (
              <div className="flex flex-col h-full">
                <div className={`flex items-center space-x-2 p-4 border-b sticky top-0 ${
                  isDarkMode ? 'bg-dark-secondary border-dark-border text-dark-primary' : 'bg-white'
                }`}>
                  <button 
                    onClick={() => setSelectedChatFriend(null)}
                    className="text-[#0095F6] hover:text-blue-700"
                  >
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {selectedChatFriend.profilePic ? (
                        <img 
                          src={selectedChatFriend.profilePic} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h2 className="font-semibold">{selectedChatFriend.username}</h2>
                  </div>
                </div>
                <div className="flex-1">
                  <Chat friend={selectedChatFriend} />
                </div>
              </div>
            ) : (
              <ChatList onSelectFriend={setSelectedChatFriend} />
            )}
          </div>
        );
      // ...other cases...
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-primary text-dark-primary' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-50 ${
        isDarkMode ? 'bg-dark-secondary border-dark-border text-dark-primary' : 'bg-white'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaInstagram className="text-2xl sm:text-3xl text-[#0095F6]" />
            <h1 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
              Fake Insta
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className={`p-2 rounded-full relative ${
                  isDarkMode ? 'hover:bg-dark-primary' : 'hover:bg-gray-100'
                }`}
              >
                <FaUserPlus className={`text-xl ${isDarkMode ? 'text-dark-primary' : ''}`} />
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {friendRequests.length}
                  </span>
                )}
              </button>

              {/* Friend Requests Dropdown */}
              {showRequests && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border ${
                  isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-4">
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-dark-primary' : ''}`}>
                      Friend Requests
                    </h3>
                    {friendRequests.length > 0 ? (
                      <div className="space-y-4">
                        {friendRequests.map(request => (
                          <div key={request._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {request.sender.profilePic ? (
                                  <img
                                    src={request.sender.profilePic}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaUser className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <span className={`font-medium ${isDarkMode ? 'text-dark-primary' : ''}`}>
                                {request.sender.username}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRequest(request._id, 'accepted')}
                                className="px-3 py-1 bg-[#0095f6] text-white text-sm rounded hover:bg-blue-600"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRequest(request._id, 'rejected')}
                                className={`px-3 py-1 text-sm rounded ${
                                  isDarkMode 
                                    ? 'bg-dark-primary text-dark-primary' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                        No pending friend requests
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#0095F6]"></div>
            ) : refreshStatus && (
              <span className={`text-sm ${
                refreshStatus.includes('Error') ? 'text-red-500' : 'text-green-500'
              }`}>
                {refreshStatus}
              </span>
            )}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowRequests(!showRequests)}
                  className={`p-2 rounded-full relative ${
                    isDarkMode ? 'hover:bg-dark-primary' : 'hover:bg-gray-100'
                  }`}
                >
                  <FaUserPlus className={`text-xl ${isDarkMode ? 'text-dark-primary' : ''}`} />
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
                {showRequests && (
                  <div className={`absolute left-0 mt-2 w-80 rounded-lg shadow-lg border ${
                    isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white border-gray-200'
                  }`}>
                    {/* Existing friend requests dropdown content */}
                    <div className="p-4">
                      <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-dark-primary' : ''}`}>
                        Friend Requests
                      </h3>
                      {friendRequests.length > 0 ? (
                        <div className="space-y-4">
                          {friendRequests.map(request => (
                            <div key={request._id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                  {request.sender.profilePic ? (
                                    <img
                                      src={request.sender.profilePic}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <FaUser className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <span className={`font-medium ${isDarkMode ? 'text-dark-primary' : ''}`}>
                                  {request.sender.username}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleRequest(request._id, 'accepted')}
                                  className="px-3 py-1 bg-[#0095f6] text-white text-sm rounded hover:bg-blue-600"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRequest(request._id, 'rejected')}
                                  className={`px-3 py-1 text-sm rounded ${
                                    isDarkMode 
                                      ? 'bg-dark-primary text-dark-primary' 
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                          No pending friend requests
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleMessagesClick}
                className="text-[#0095F6] hover:text-blue-700 flex items-center space-x-2 relative"
              >
                <FaComments className="text-xl" />
                <span className="hidden sm:inline">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadMessages={unreadMessages}
          isPrivate={isPrivate}
          togglePrivacy={togglePrivacy}
          onShowAccount={setShowAccount}
        />
        <main className="w-full flex-1 pb-20 sm:pb-0 sm:ml-64">
          <div className={`flex-1 ${isDarkMode ? 'bg-dark-primary' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-2 sm:px-4 flex justify-center">
              <div className="w-full max-w-[500px] sm:max-w-none">
                {renderContent()}
              </div>
            </div>
          </div>
          
          {/* Account Settings Panel */}
          {showAccount && (
            <div className={`fixed inset-0 sm:inset-auto sm:right-0 sm:top-[57px] sm:bottom-0 sm:w-80 border-l 
              ${isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'} 
              overflow-y-auto z-50`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                    Account Settings
                  </h2>
                  <button 
                    onClick={() => setShowAccount(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                
                <div className={`space-y-4 ${isDarkMode ? 'text-dark-primary' : ''}`}>
                  <div className={`p-4 border rounded-lg ${
                    isDarkMode ? 'border-dark-border' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Private Account</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                          Only friends can see your posts
                        </p>
                      </div>
                      <button
                        onClick={togglePrivacy}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          isPrivate 
                            ? 'bg-[#0095F6]' 
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                          isPrivate ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-medium mb-2">Privacy</h3>
                    <p className="text-sm text-gray-500">Manage your account privacy settings</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-medium mb-2">Security</h3>
                    <p className="text-sm text-gray-500">Update your security preferences</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h3 className="font-medium mb-2">Notifications</h3>
                    <p className="text-sm text-gray-500">Control your notification settings</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default HomePage;
