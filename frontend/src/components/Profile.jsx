import { useState } from 'react';
import { FaUser, FaUpload, FaEllipsisV } from 'react-icons/fa';
import axios, { API_URL } from '../config/axios';
import PopupModal from './PopupModal';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ profileData, isEditing, handleSaveProfile, setSelectedImage, handleDelete, ...props }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const { isDarkMode } = useTheme();

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

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className={`rounded-lg p-4 sm:p-6 mb-6 ${
        isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
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

          {/* Profile Info Section */}
          <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                {profileData.user.username}
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => props.setIsEditing(true)}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-[#0095F6] text-white rounded-lg hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 sm:flex-initial px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      props.setIsEditing(false);
                      props.setNewDisplayName(profileData.user.displayName || '');
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center sm:justify-start gap-6 mt-4">
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
              <input
                type="text"
                value={props.newDisplayName}
                onChange={(e) => props.setNewDisplayName(e.target.value)}
                className={`mt-4 w-full max-w-md p-2 rounded-lg focus:ring-2 focus:ring-[#0095F6] ${
                  isDarkMode 
                    ? 'bg-dark-primary border-dark-border text-dark-primary' 
                    : 'border'
                }`}
                placeholder="Display name"
              />
            ) : (
              <p className={`mt-4 ${isDarkMode ? 'text-dark-secondary' : 'text-gray-600'}`}>
                {profileData.user.displayName || 'No display name set'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
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
