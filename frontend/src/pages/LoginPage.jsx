import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import axios, { API_URL } from '../config/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleAuth = async (isLogin) => {
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const data = isLogin ? { email, password } : { username, email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, data);
      
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isAdmin", res.data.user.isAdmin);
        navigate('/home');
      } else {
        alert("User Registered! Please Login.");
        setView("login");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-4 bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-8">
          <FaInstagram className="text-5xl text-[#0095F6]" />
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {view === "login" ? "Login to Instagram by Ranveer" : "Create Account"}
        </h2>
        {view === "register" && (
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:border-[#0095F6]"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:border-[#0095F6]"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:border-[#0095F6]"
        />
        <button
          onClick={() => handleAuth(view === "login")}
          className="w-full bg-[#0095F6] text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {view === "login" ? "Log In" : "Sign Up"}
        </button>
        <div className="mt-6 text-sm text-center text-gray-500">
          {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setView(view === "login" ? "register" : "login")}
            className="text-[#0095F6] font-medium hover:text-blue-600"
          >
            {view === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>This is a demonstration project created to showcase development skills.</p>
          <p className="mt-1">Not affiliated with Instagram or Meta.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
