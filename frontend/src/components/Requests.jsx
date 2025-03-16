import { useState, useEffect } from 'react';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';

const Requests = () => {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/friend-requests`);
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/friend-requests/${requestId}`, { status });
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      console.error('Error handling request:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0095F6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className={`${isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'} rounded-lg p-4`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-dark-primary' : ''}`}>
          Friend Requests
        </h2>
        {requests.length === 0 ? (
          <p className={`text-center ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'} py-4`}>
            No pending requests
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div 
                key={request._id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  isDarkMode ? 'bg-dark-primary border-dark-border' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {request.sender.profilePic ? (
                      <img 
                        src={request.sender.profilePic} 
                        alt={request.sender.username}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-dark-primary' : ''}`}>
                      {request.sender.username}
                    </p>
                    {request.sender.displayName && (
                      <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'}`}>
                        {request.sender.displayName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(request._id, 'accepted')}
                    className="p-2 bg-[#0095F6] text-white rounded-lg hover:bg-blue-600"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleRequest(request._id, 'rejected')}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-dark-primary text-dark-primary hover:bg-dark-secondary' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
