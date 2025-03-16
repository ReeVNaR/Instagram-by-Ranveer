import { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ChatList = ({ onSelectFriend }) => {
  const { isDarkMode } = useTheme();
  const [friends, setFriends] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (friends.length > 0) {
      friends.forEach(friend => {
        fetchLastMessage(friend._id);
      });
    }
  }, [friends]);

  const fetchLastMessage = async (friendId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/${friendId}`);
      if (res.data.length > 0) {
        const lastMessage = res.data[res.data.length - 1];
        setLastMessages(prev => ({
          ...prev,
          [friendId]: lastMessage
        }));
      }
    } catch (err) {
      console.error('Error fetching last message:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_URL}/friends`);
      setFriends(res.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const promises = friends.map(friend =>
        axios.get(`${API_URL}/messages/${friend._id}/unread/count`)
      );
      const responses = await Promise.all(promises);
      const counts = {};
      friends.forEach((friend, index) => {
        counts[friend._id] = responses[index].data.count;
      });
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  useEffect(() => {
    if (friends.length > 0) {
      fetchUnreadCounts();
      const interval = setInterval(fetchUnreadCounts, 5000);
      return () => clearInterval(interval);
    }
  }, [friends]);

  const handleFriendClick = async (friend) => {
    try {
      // Reset unread count for this friend
      setUnreadCounts(prev => ({
        ...prev,
        [friend._id]: 0
      }));
      
      // Mark messages as read when entering chat
      await axios.get(`${API_URL}/messages/${friend._id}`);
      
      if (onSelectFriend) {
        onSelectFriend(friend);
      } else {
        localStorage.setItem('selectedFriend', JSON.stringify(friend));
        navigate(`/chat/${friend._id}`);
      }
    } catch (err) {
      console.error('Error handling friend click:', err);
    }
  };

  return (
    <div className={`w-full ${isDarkMode ? 'bg-dark-secondary' : 'bg-white'}`}>
      <div className={`p-4 border-b ${
        isDarkMode ? 'bg-dark-secondary border-dark-border text-dark-primary' : 'bg-gray-50'
      }`}>
        <h2 className="font-semibold text-lg">Friends</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-180px)]">
        {friends.map(friend => (
          <div
            key={friend._id}
            onClick={() => handleFriendClick(friend)}
            className={`flex items-center p-3 cursor-pointer border-b relative ${
              isDarkMode 
                ? 'hover:bg-dark-primary border-dark-border' 
                : 'hover:bg-gray-50 border-gray-100'
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {friend.profilePic ? (
                <img 
                  src={friend.profilePic} 
                  alt={friend.username}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-gray-400 text-xl" />
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`font-medium truncate ${
                  isDarkMode ? 'text-dark-primary' : ''
                }`}>{friend.username}</p>
                {unreadCounts[friend._id] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                    {unreadCounts[friend._id]}
                  </span>
                )}
              </div>
              <p className={`text-sm truncate ${
                isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
              }`}>
                {lastMessages[friend._id] ? (
                  <span className={!lastMessages[friend._id].read && lastMessages[friend._id].sender._id !== friend._id ? 'font-semibold' : ''}>
                    {lastMessages[friend._id].sender._id === friend._id ? '' : 'You: '}
                    {lastMessages[friend._id].content}
                  </span>
                ) : (
                  'No messages yet'
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
