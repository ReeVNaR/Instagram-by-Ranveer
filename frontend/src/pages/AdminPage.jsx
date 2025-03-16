import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios, { API_URL } from "../config/axios";

const AdminPage = () => {
  const navigate = useNavigate();
  const [adminImages, setAdminImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      navigate('/home');
      return;
    }
    fetchAdminImages();
  }, [navigate]);

  const fetchAdminImages = async () => {
    if (!localStorage.getItem("isAdmin")) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/images`);
      setAdminImages(res.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-2xl font-semibold mb-6">Admin Dashboard</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095F6] mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminImages.map((img) => (
              <div key={img._id} className="relative group">
                <img 
                  src={img.url}
                  alt="Uploaded"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded">
                  <p className="text-sm">User: {img.userId?.username}</p>
                  <p className="text-xs">{new Date(img.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
