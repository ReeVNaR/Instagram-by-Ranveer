import { useState, useEffect } from 'react';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/friend-requests`);
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/friend-requests/${requestId}`, { status });
      fetchRequests();
    } catch (err) {
      console.error('Error handling request:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-dark-primary' : ''}`}>
        Friend Requests
      </h2>
      <div className="space-y-4">
        {requests.map(request => (
          <div key={request._id} className={`flex items-center justify-between p-4 rounded-lg ${
            isDarkMode ? 'bg-dark-secondary' : 'bg-white'
          } border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {request.sender.profilePic ? (
                  <img src={request.sender.profilePic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-full h-full p-3 text-gray-400" />
                )}
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-dark-primary' : ''}`}>
                  {request.sender.username}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                  Sent you a friend request
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRequest(request._id, 'accepted')}
                className="p-2 bg-[#0095f6] text-white rounded-lg hover:bg-blue-600"
              >
                <FaCheck className="text-sm" />
              </button>
              <button
                onClick={() => handleRequest(request._id, 'rejected')}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-dark-primary text-dark-primary' : 'bg-gray-100'
                } hover:bg-gray-200`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className={`text-center ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
            No pending friend requests
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
