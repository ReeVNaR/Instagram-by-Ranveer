import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Chat from '../components/Chat';

const ChatPage = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const friend = JSON.parse(localStorage.getItem('selectedFriend'));

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4 flex items-center space-x-4">
        <button 
          onClick={() => navigate('/home')}
          className="text-[#0095F6] hover:text-blue-700"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-semibold">Chat with {friend?.username}</h1>
      </div>
      <div className="flex-1">
        <Chat friend={friend} />
      </div>
    </div>
  );
};

export default ChatPage;
