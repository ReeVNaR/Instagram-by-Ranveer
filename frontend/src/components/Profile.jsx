import { useState } from 'react';
import { FaUser, FaUpload, FaEllipsisV, FaCog, FaSignOutAlt, FaMoon, FaSun, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios, { API_URL } from '../config/axios';
import PopupModal from './PopupModal';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ profileData, isEditing, handleSaveProfile, setSelectedImage, handleDelete, isPrivate, togglePrivacy, ...props }) => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  if (!profileData) return null;

  const handleDeleteClick = (e, postId) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, postId });
    setActiveDropdown(null);
  };

  const toggleDropdown = (e, postId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  const handleConfirmDelete = () => {
    handleDelete(deleteModal.postId);
    setDeleteModal({ isOpen: false, postId: null });
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create FormData with the new image
      const formData = new FormData();
      formData.append("image", file);
      
      // The backend will handle deleting the old image from Cloudinary
      const response = await axios.post(`${API_URL}/profile/picture`, formData);

      if (response.data && response.data.profilePic) {
        profileData.user.profilePic = response.data.profilePic;
        setProfilePic(file); // Force re-render
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
      alert("Failed to update profile picture");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-0 sm:px-4">
      {/* Mobile Settings Bar */}
      <div className="relative">
        <div className={`sm:hidden flex justify-center items-center p-4 mb-2 w-full ${
          isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white'
        }`}>
          <div className="flex justify-between w-full max-w-[300px]">
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className={`flex items-center space-x-2 ${
                isDarkMode ? 'text-dark-primary' : 'text-gray-700'
              }`}
            >
              <FaCog className={`text-xl transition-transform duration-200 ${showMobileSettings ? 'rotate-45' : ''}`} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Settings Dropdown */}
        {showMobileSettings && (
          <div className={`sm:hidden absolute top-full left-0 right-0 z-50 ${
            isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
          } border-t shadow-lg`}>
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  togglePrivacy();
                  setShowMobileSettings(false);
                }}
                className="w-full flex items-center justify-between p-2"
              >
                <div className="flex items-center space-x-2">
                  <FaLock className={isDarkMode ? 'text-dark-primary' : 'text-gray-700'} />
                  <span>Private Account</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  isPrivate ? 'bg-[#0095F6]' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                    isPrivate ? 'translate-x-4' : 'translate-x-1'
                  }`} />
                </div>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  setShowMobileSettings(false);
                }}
                className="w-full flex items-center justify-between p-2"
              >
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileSettings(false);
                }}
                className="w-full flex items-center space-x-2 p-2 text-red-500"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className={`w-full rounded-lg p-3 sm:p-6 mb-4 ${
        isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white'
      }`}>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          {/* Profile Image Section */}
          <div className="relative group">
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
                  <FaUser className="text-gray-500 text-4xl" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200">
                <label className="cursor-pointer w-full h-full flex items-center justify-center">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleProfilePicChange}
                    accept="image/*"
                  />
                  <FaUpload className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl" />
                </label>
              </div>
            )}
          </div>

          {/* Profile Info Section - Updated for desktop logout */}
          <div className="flex-1 w-full sm:w-auto text-center sm:text-left space-y-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                {profileData.user.username}
              </h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => props.setIsEditing(true)}
                      className="min-w-[120px] px-4 py-2 text-sm bg-[#0095F6] text-white rounded-lg hover:bg-blue-600"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
                    >
                      <FaSignOutAlt className="text-sm" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                    <button
                      onClick={handleSaveProfile}
                      className="min-w-[80px] px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        props.setIsEditing(false);
                        props.setNewDisplayName(profileData.user.displayName || '');
                      }}
                      className="min-w-[80px] px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center sm:justify-start gap-6">
              <div>
                <span className={`font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                  {profileData.user.friends?.length || 0}
                </span>
                <span className={isDarkMode ? 'text-dark-secondary ml-2' : 'text-gray-500 ml-2'}>
                  friends
                </span>
              </div>
              <div>
                <span className={`font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                  {profileData.posts.length}
                </span>
                <span className={isDarkMode ? 'text-dark-secondary ml-2' : 'text-gray-500 ml-2'}>
                  posts
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="flex justify-center sm:justify-start">
                <input
                  type="text"
                  value={props.newDisplayName}
                  onChange={(e) => props.setNewDisplayName(e.target.value)}
                  className={`mt-4 w-full max-w-[300px] sm:max-w-md p-2 rounded-lg focus:ring-2 focus:ring-[#0095F6] ${
                    isDarkMode 
                      ? 'bg-dark-primary border-dark-border text-dark-primary' 
                      : 'border'
                  }`}
                  placeholder="Display name"
                />
              </div>
            ) : (
              <p className={`mt-4 ${isDarkMode ? 'text-dark-secondary' : 'text-gray-600'}`}>
                {profileData.user.displayName || 'No display name set'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid - Updated for mobile */}
      <div className="grid grid-cols-3 gap-[2px] sm:gap-4 mx-auto w-full">
        {profileData.posts.map((post) => (
          <div
            key={post._id}
            className={`relative aspect-square group ${
              isDarkMode ? 'bg-dark-secondary' : 'bg-white'
            } rounded-lg overflow-hidden`}
            onClick={() => setSelectedImage(post)}
          >
            <img
              src={post.url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => toggleDropdown(e, post._id)}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-black bg-opacity-50 hover:bg-opacity-75' 
                    : 'bg-white bg-opacity-75 hover:bg-opacity-100'
                } text-gray-700`}
              >
                <FaEllipsisV className={isDarkMode ? 'text-white' : 'text-gray-700'} />
              </button>
              {activeDropdown === post._id && (
                <div 
                  className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 ${
                    isDarkMode 
                      ? 'bg-dark-secondary border border-dark-border' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => handleDeleteClick(e, post._id)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-dark-primary' 
                          : 'text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      Delete post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <PopupModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
};

export default Profile;
