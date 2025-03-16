import { useState, useEffect, useRef } from 'react';
import { FaSmile, FaPaperPlane } from 'react-icons/fa';
import axios, { API_URL } from "../config/axios";
import { useTheme } from '../context/ThemeContext';

const Chat = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const { isDarkMode } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.id);
    }
  }, []);

  useEffect(() => {
    if (friend?._id) {
      fetchMessages();
      // Mark messages as read when chat component mounts
      markMessagesAsRead();
    }
  }, [friend?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/${friend._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.get(`${API_URL}/messages/${friend._id}`);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/messages/${friend._id}`, {
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-600">Welcome to Chat</h3>
          <p className="text-gray-500 mt-2">Select a friend to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-180px)] ${
      isDarkMode ? 'bg-dark-primary' : 'bg-[#f0f2f5]'
    }`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(message => (
          <div
            key={message._id}
            className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.sender._id === userId
                ? isDarkMode ? 'bg-[#0095F6]' : 'bg-[#dcf8c6]'
                : isDarkMode ? 'bg-dark-secondary' : 'bg-white'
            }`}>
              <p className={isDarkMode ? 'text-dark-primary' : 'text-gray-800'}>
                {message.content}
              </p>
              <p className={`text-right text-xs mt-1 ${
                isDarkMode ? 'text-dark-secondary' : 'text-gray-500'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className={`p-3 border-t flex items-center space-x-2 ${
        isDarkMode ? 'bg-dark-secondary border-dark-border' : 'bg-white'
      }`}>
        <button
          type="button"
          className={`p-2 ${isDarkMode ? 'text-dark-secondary hover:text-dark-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FaSmile className="text-xl" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0095F6] ${
            isDarkMode ? 'bg-dark-primary text-dark-primary placeholder-gray-500' : 'bg-gray-100'
          }`}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 text-[#0095F6] hover:text-blue-700 disabled:opacity-50 disabled:hover:text-[#0095F6]"
        >
          <FaPaperPlane className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
