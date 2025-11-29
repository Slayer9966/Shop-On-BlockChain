import { useState, useEffect } from 'react';
import { Settings, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    }

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, [navigate]);

  // Handle form submission - authenticate with blockchain
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login for:', formData.email);
      
      const response = await axios.post("http://localhost:5000/api/login", {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const user = response.data.user;
        
        console.log('✅ Login successful:', user);

        // Store user session in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }));

        // Store email if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Show success message
        alert(`✅ Welcome back, ${user.username}!\n\nUser ID: ${user.id}\nRole: ${user.role}`);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with error
        const errorMsg = err.response.data.message || err.response.data.error || 'Login failed';
        alert("❌ " + errorMsg);
      } else if (err.request) {
        // Request made but no response
        alert("❌ Cannot connect to server.\n\nMake sure:\n- Backend is running on http://localhost:5000\n- Blockchain node is running\n- Contract is deployed");
      } else {
        // Something else happened
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

  const handleSignupRedirect = () => {
    if (!loading) {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Allura', cursive" }}>
      
      {/* Import Allura font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');`}
      </style>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_99px,#1f2937_100px),linear-gradient(180deg,transparent_99px,#1f2937_100px)] bg-[length:100px_100px] opacity-10 pointer-events-none animate-pulse"></div>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-700/40 rounded-full blur-3xl -top-48 -left-48 animate-ping"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -bottom-48 -right-48 animate-ping delay-700"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-20 animate-bounce">
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer transform transition-all duration-500 hover:scale-110 hover:rotate-12 hover:shadow-2xl"
        >
          <img 
            src="/src/assets/logo.png"
            alt="Logo"
            className="w-18 h-18 rounded-full shadow-lg border-2 border-white/30 hover:border-purple-400 transition-all duration-300"
          />
        </div>
      </div>

      {/* Settings Button */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-20 animate-fade-in">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2.5 bg-white/20 backdrop-blur-md text-gray-200 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-purple-400"
            disabled={loading}
          >
            <Settings className="w-6 h-6" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-2xl overflow-hidden animate-fade-in border border-purple-700 z-30">
              <button 
                onClick={() => navigate('/admin')}
                className="w-full px-4 py-3 text-left text-gray-200 hover:bg-purple-900 flex items-center gap-2 transition-colors duration-200"
              >
                <ChevronDown className="w-4 h-4" />
                <span className="font-medium text-lg">Open Admin Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl animate-slide-up">
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700 transition-shadow duration-500 hover:shadow-3xl">

          <div className="flex flex-col md:flex-row">

            {/* Left Image Area */}
            <div className="md:w-1/2 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-12 flex flex-col items-center justify-start relative">
              <img 
                src="/src/assets/login.gif"
                alt="Welcome"
                className="w-full max-w-md rounded-2xl shadow-2xl animate-fade-in-up"
              />
              <h2 className="absolute top-80 text-white text-4xl font-bold text-center px-4" style={{ fontFamily: "'Allura', cursive" }}>
                Welcome Back
              </h2>
              <p className="absolute top-96 text-white text-xl text-center px-4 mt-2 opacity-80" style={{ fontFamily: "'Allura', cursive" }}>
                Secured by Blockchain 🔐
              </p>
            </div>

            {/* Right Login Form */}
            <div className="md:w-1/2 p-12">
              <div className="max-w-md mx-auto">

                <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in-down" style={{ fontFamily: "'Allura', cursive" }}>
                  Login
                </h1>
                <p className="text-gray-300 mb-8 text-lg animate-fade-in-down" style={{ fontFamily: "'Allura', cursive" }}>
                  Enter your credentials to continue
                </p>

                <div className="space-y-6">

                  {/* Email */}
                  <div>
                    <label className="block text-lg font-medium text-gray-200 mb-2" style={{ fontFamily: "'Allura', cursive" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter email"
                      style={{ fontFamily: "'Allura', cursive", fontSize: '18px' }}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-lg font-medium text-gray-200 mb-2" style={{ fontFamily: "'Allura', cursive" }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter password"
                        style={{ fontFamily: "'Allura', cursive", fontSize: '18px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer" style={{ fontFamily: "'Allura', cursive" }}>
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-300 disabled:opacity-50"
                      />
                      <span className="ml-2 text-lg text-gray-300">Remember me</span>
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ fontFamily: "'Allura', cursive" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>

                  {/* Signup Link */}
                  <div className="text-center mt-4">
                    <p className="text-gray-300 text-lg" style={{ fontFamily: "'Allura', cursive" }}>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={handleSignupRedirect}
                        disabled={loading}
                        className="text-purple-400 hover:text-purple-300 underline transition-colors disabled:opacity-50"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>

                  {/* Info Box */}
                  {!loading && (
                    <div className="mt-6 p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                      <p className="text-gray-300 text-sm text-center" style={{ fontFamily: "'Allura', cursive", fontSize: '16px' }}>
                        🔒 Your credentials are verified against encrypted blockchain records
                      </p>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}