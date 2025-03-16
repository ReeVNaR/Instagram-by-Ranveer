import { useTheme } from '../context/ThemeContext';

const PopupModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-lg p-6 max-w-sm w-full ${
        isDarkMode ? 'bg-dark-secondary' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-dark-primary' : ''
        }`}>{title}</h3>
        <p className={isDarkMode ? 'text-dark-secondary mb-6' : 'text-gray-600 mb-6'}>
          {message}
        </p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'text-dark-primary hover:bg-dark-primary' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
