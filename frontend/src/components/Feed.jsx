import { FaUser, FaHeart, FaRegHeart } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';

const Feed = ({ feedPosts, setSelectedImage, setFeedPosts }) => {
  const { isDarkMode } = useTheme();

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/like`);
      const updatedPosts = feedPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: res.data.liked ? (post.likes + 1) : (post.likes - 1),
            isLiked: res.data.liked
          };
        }
        return post;
      });
      setFeedPosts(updatedPosts);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (feedPosts.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-dark-secondary border-dark-border text-dark-primary' : 'bg-white'} border rounded-lg p-8 text-center`}>
        <h2 className="text-xl font-semibold mb-2">Welcome to Fake Insta!</h2>
        <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'} mb-4`}>
          Follow friends to see their posts in your feed
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
          Note: Some posts may be hidden if the account is private
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedPosts.map((post) => (
        <div key={post._id} className={`border rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-dark-secondary border-dark-border text-dark-primary' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center space-x-3 ${
            isDarkMode ? 'border-dark-border' : ''
          }`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {post.userId?.profilePic ? (
                <img 
                  src={post.userId.profilePic} 
                  alt={post.userId.username}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold">{post.userId?.username}</p>
              {post.userId?.displayName && (
                <p className="text-sm text-gray-500">{post.userId.displayName}</p>
              )}
            </div>
          </div>
          
          {/* Image container */}
          <div className="relative bg-black flex justify-center">
            <div className={post.aspectRatio === '4:5' 
              ? 'w-full aspect-[4/5]' 
              : post.aspectRatio === '1.91:1'
              ? 'w-full aspect-[1.91/1]'
              : 'w-full aspect-square'}>
              <img 
                src={post.url} 
                alt="Post" 
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setSelectedImage(post)}
              />
            </div>
          </div>

          {/* Likes and caption */}
          <div className={`p-4 ${isDarkMode ? 'text-dark-primary' : ''}`}>
            <div className="flex items-center space-x-4 mb-3">
              <button 
                onClick={() => handleLike(post._id)}
                className={`text-2xl ${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:scale-110 transition-transform`}
              >
                {post.isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
              <span className="text-sm font-semibold">
                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
              </span>
            </div>
            {post.caption && (
              <p className="mb-2">
                <span className="font-semibold">{post.userId?.username}</span>{" "}
                <span>{post.caption}</span>
              </p>
            )}
            <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
