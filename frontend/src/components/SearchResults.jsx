import { FaUser } from 'react-icons/fa';

const SearchResults = ({ results, onClose }) => {
  if (!results.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-2 shadow-lg max-h-64 overflow-y-auto z-50">
      {results.map(user => (
        <div 
          key={user._id} 
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.username}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{user.username}</p>
            {user.displayName && (
              <p className="text-sm text-gray-500">{user.displayName}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
