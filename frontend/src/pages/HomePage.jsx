import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaSignOutAlt, FaArrowLeft, FaUser } from 'react-icons/fa';
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
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    if (activeTab === 'feed') {
      fetchFeed();
    } else if (activeTab === 'profile') {
      fetchProfile();
    } else {
      fetchImages();
    }
  }, [navigate, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate('/');
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
          <div className="flex items-center space-x-3">
            <FaInstagram className="text-2xl sm:text-3xl text-[#0095F6]" />
            <h1 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
              Fake Insta
            </h1>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[#0095F6] hover:text-blue-700 flex items-center space-x-2"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadMessages={unreadMessages}
          onShowAccount={setShowAccount}
        />
        <div className={`flex-1 ml-16 sm:ml-64 ${isDarkMode ? 'bg-dark-primary' : 'bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto p-2 sm:p-4">
            {renderContent()}
          </div>
        </div>
        
        {/* Account Settings Panel */}
        {showAccount && (
          <div className={`fixed right-0 top-[57px] bottom-0 w-80 border-l ${
            isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
          } overflow-y-auto`}>
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
      </div>

      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default HomePage;
