import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ImageModal = ({ image, onClose }) => {
  const { isDarkMode } = useTheme();

  if (!image) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-4xl w-full rounded-lg overflow-hidden relative ${
          isDarkMode ? 'bg-dark-secondary' : 'bg-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between z-10">
          <button 
            onClick={onClose}
            className="text-white hover:opacity-75 flex items-center gap-2"
          >
            <FaArrowLeft className="text-xl" />
            <span>Back</span>
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:opacity-75"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3 bg-black flex items-center">
            <img 
              src={image.url} 
              alt="Full size"
              className="w-full h-auto max-h-[60vh] md:max-h-[80vh] object-contain"
            />
          </div>
          <div className="w-full md:w-1/3 p-3 sm:p-4">
            <div className="border-b pb-3 sm:pb-4">
              <p className="text-sm sm:text-base font-semibold">Posted by: {image.userId?.username || 'User'}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(image.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
