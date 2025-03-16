import { useState } from 'react';
import { FaUser, FaUpload, FaTrash } from 'react-icons/fa';
import PopupModal from './PopupModal';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ profileData, isEditing, handleSaveProfile, setSelectedImage, handleDelete, ...props }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [profilePic, setProfilePic] = useState(null);
  const { isDarkMode } = useTheme();

  if (!profileData) return null;

  const handleDeleteClick = (e, postId) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, postId });
  };

  const handleConfirmDelete = () => {
    handleDelete(deleteModal.postId);
    setDeleteModal({ isOpen: false, postId: null });
  };

  const handleProfilePicUpdate = async () => {
    if (!profilePic) return;
    try {
      const formData = new FormData();
      formData.append("image", profilePic);
      await axios.post(`${API_URL}/profile/picture`, formData);
      // Refresh profile data after update
      window.location.reload();
    } catch (err) {
      alert("Failed to update profile picture");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <div className={`rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 ${
        isDarkMode ? 'bg-dark-secondary border border-dark-border' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className={`text-2xl font-semibold mb-4 sm:mb-0 ${
            isDarkMode ? 'text-dark-primary' : ''
          }`}>Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => props.setIsEditing(true)}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-[#0095F6] text-white rounded-lg hover:bg-blue-600"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex w-full sm:w-auto space-x-2 mt-4 sm:mt-0">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  props.setIsEditing(false);
                  props.setNewDisplayName(profileData.user.displayName || '');
                }}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
                  
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
            <div className={`w-20 h-20 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-dark-primary' : 'bg-gray-200'
            }`}>
              {profileData.user.profilePic ? (
                <img 
                  src={profileData.user.profilePic} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-500 text-4xl" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all cursor-pointer">
                <label className="cursor-pointer w-full h-full flex items-center justify-center">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      setProfilePic(e.target.files[0]);
                      handleProfilePicUpdate();
                    }}
                    accept="image/*"
                  />
                  <FaUpload className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </label>
              </div>
            )}
          </div>
                    
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-dark-primary' : ''
              }`}>{profileData.user.username}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
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
            </div>
            {isEditing ? (
              <input
                type="text"
                value={props.newDisplayName}
                onChange={(e) => props.setNewDisplayName(e.target.value)}
                className={`mt-4 w-full sm:max-w-md p-2 rounded-lg focus:ring-2 focus:ring-[#0095F6] ${
                  isDarkMode 
                    ? 'bg-dark-primary border-dark-border text-dark-primary' 
                    : 'border'
                }`}
                placeholder="Display name"
              />
            ) : (
              <p className={isDarkMode ? 'text-dark-secondary mt-2' : 'text-gray-600 mt-2'}>
                {profileData.user.displayName || 'No display name set'}
              </p>
            )}
          </div>
        </div>
      </div>
                
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-4">
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
              className="w-full h-full object-cover rounded-sm sm:rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-sm sm:rounded-lg">
              <button
                onClick={(e) => handleDeleteClick(e, post._id)}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-red-500"
              >
                <FaTrash className="text-xl" />
              </button>
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
