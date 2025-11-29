import { useState } from 'react';
import { Settings, ChevronDown, User, Mail, Lock, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });

  const navigate = useNavigate();

  // Handle form submission - sends to blockchain
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    // Basic validation
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/signup", {
        name: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}\n\nTransaction Hash: ${response.data.transactionHash}\nBlock: ${response.data.blockNumber}`);
        
        // Store user info in localStorage if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        }
        
        navigate("/login");
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert("❌ Error: " + (err.response.data.message || err.response.data.error || "Unknown error"));
      } else if (err.request) {
        alert("❌ Cannot connect to server. Make sure the backend is running on http://localhost:5000");
      } else {
        alert("❌ Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoClick = () => navigate('/home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-blue-950 flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Allura', cursive" }}>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
            50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
          
          .glow-animation {
            animation: glow 2s ease-in-out infinite;
          }
          
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}
      </style>

      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-pink-600/20 rounded-full blur-3xl top-1/2 right-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Logo with enhanced styling */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-20 float-animation">
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer transform transition-all duration-500 hover:scale-110 hover:rotate-12 glow-animation"
        >
          <img 
            src="/src/assets/logo.png"
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-2xl border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300"
          />
        </div>
      </div>

      {/* Settings with enhanced dropdown */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-3 bg-white/10 backdrop-blur-xl text-gray-200 rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-400 glow-animation"
          >
            <Settings className="w-6 h-6" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-500/50 z-30 animate-fade-in">
              <button 
                onClick={() => navigate('/admin')}
                className="w-full px-5 py-4 text-left text-gray-200 hover:bg-purple-900/50 flex items-center gap-3 transition-all duration-200 group"
              >
                <ChevronDown className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium text-lg">Open Admin Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container with enhanced design */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-500/30 transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]">

          <div className="flex flex-col md:flex-row">

            {/* Left Image Section - Enhanced */}
            <div className="md:w-1/2 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full shimmer opacity-50"></div>
              
              <div className="relative z-10 text-center">
                <div className="mb-8 float-animation">
                  <img 
                    src="/src/assets/login.gif"
                    alt="Welcome"
                    className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-purple-500/30"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  
                  <h2 className="text-white text-5xl font-bold mb-4" style={{ fontFamily: "'Allura', cursive" }}>
                    Join the Electron
                  </h2>
                  <h3 className="text-purple-300 text-4xl font-bold" style={{ fontFamily: "'Allura', cursive" }}>
                    Ecosystem
                  </h3>
                  
                  <p className="text-gray-300 text-lg mt-4 px-4" style={{ fontFamily: "'Allura', cursive" }}>
                    Secure, Decentralized, Revolutionary
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mt-6 text-purple-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Blockchain Secured</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Signup Form - Enhanced */}
            <div className="md:w-1/2 p-12 relative">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="max-w-md mx-auto relative z-10">

                <div className="text-center mb-8">
                  <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "'Allura', cursive" }}>
                    Create Account
                  </h1>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500"></div>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500"></div>
                  </div>
                  <p className="text-gray-300 text-lg" style={{ fontFamily: "'Allura', cursive" }}>
                    Secured by blockchain technology 🔐
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="group">
                    <label className="block text-lg font-medium text-gray-200 mb-2 flex items-center gap-2" style={{ fontFamily: "'Allura', cursive" }}>
                      <User className="w-5 h-5 text-purple-400" />
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-600 bg-gray-900/50 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                        placeholder="Enter username"
                        style={{ fontFamily: "'Allura', cursive", fontSize: '18px' }}
                        required
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-lg font-medium text-gray-200 mb-2 flex items-center gap-2" style={{ fontFamily: "'Allura', cursive" }}>
                      <Mail className="w-5 h-5 text-purple-400" />
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-600 bg-gray-900/50 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                        placeholder="Enter email"
                        style={{ fontFamily: "'Allura', cursive", fontSize: '18px' }}
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="block text-lg font-medium text-gray-200 mb-2 flex items-center gap-2" style={{ fontFamily: "'Allura', cursive" }}>
                      <Lock className="w-5 h-5 text-purple-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-600 bg-gray-900/50 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                        placeholder="Enter password (min 6 characters)"
                        style={{ fontFamily: "'Allura', cursive", fontSize: '18px' }}
                        required
                        minLength={6}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group" style={{ fontFamily: "'Allura', cursive" }}>
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-5 h-5 text-purple-500 focus:ring-purple-300 disabled:opacity-50 rounded border-gray-600"
                      />
                      <span className="ml-3 text-lg text-gray-300 group-hover:text-white transition-colors">Remember me</span>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                    style={{ fontFamily: "'Allura', cursive" }}
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Sign Up
                          <Sparkles className="w-5 h-5" />
                        </span>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Login Link */}
                  <div className="text-center mt-6">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-4"></div>
                    <p className="text-gray-300 text-lg" style={{ fontFamily: "'Allura', cursive" }}>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-purple-400 hover:text-purple-300 underline font-semibold transition-colors duration-200"
                        disabled={loading}
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </form>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}