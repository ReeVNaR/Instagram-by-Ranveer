import { useState, useRef, useEffect } from 'react';
import { FaImage, FaCrop } from 'react-icons/fa';

const RATIOS = {
  '1:1': { width: 1080, height: 1080, label: 'Square' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait' },
  '1.91:1': { width: 1080, height: 566, label: 'Landscape' },
};

const NewPost = ({ image, setImage, caption, setCaption, handleNewPost, isLoading }) => {
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const ratio = RATIOS[selectedRatio];
      imageRef.current.style.aspectRatio = `${ratio.width}/${ratio.height}`;
    }
  };

  const handleSubmit = async () => {
    if (!image) return alert("Select an image first!");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("aspectRatio", selectedRatio);

    try {
      await handleNewPost(formData);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Image Ratio</h3>
          <div className="flex space-x-2">
            {Object.entries(RATIOS).map(([ratio, { label }]) => (
              <button
                key={ratio}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRatio === ratio
                    ? 'bg-[#0095F6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {!image ? (
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#0095F6] transition-colors">
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
              <FaImage className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
            </label>
          ) : (
            <div className="relative">
              <div 
                className="relative overflow-hidden rounded-lg"
                style={{ maxHeight: '500px' }}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="w-full object-cover"
                  onLoad={handleImageLoad}
                />
              </div>
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write a caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border rounded-lg h-24 resize-none"
            placeholder="Write a caption..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!image || isLoading}
          className="w-full bg-[#0095F6] text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Posting..." : "Share"}
        </button>
      </div>
    </div>
  );
};

export default NewPost;
