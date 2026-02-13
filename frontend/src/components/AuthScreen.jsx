import React, { useState } from 'react';
import axios from 'axios';

const AuthScreen = ({ onLoginSuccess, setMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee"
  });
  const [errors, setErrors] = useState({});

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ && /^[^\s@]+@gmail\.com$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isLogin) {
      // Signup password requirements
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    
    try {
      const res = await axios.post(`http://localhost:8080${endpoint}`, formData);
      
      if (isLogin) {
        // Store token with expiration
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("token_expires", res.data.expires_at);
        
        // Store user info
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Update app state
        onLoginSuccess(res.data.user);
        
        setMessage({ 
          text: `Welcome back, ${res.data.user.email}!`, 
          type: "success" 
        });
      } else {
        setMessage({ 
          text: "Account created successfully! Please login.", 
          type: "success" 
        });
        setIsLogin(true);
        setFormData({ email: "", password: "", role: "employee" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Authentication failed";
      
      setMessage({ 
        text: errorMessage, 
        type: "error" 
      });

      // Handle specific field errors
      if (err.response?.data?.field) {
        setErrors({ [err.response.data.field]: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-200">
        
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg shadow-indigo-200">
            {isLogin ? "?" : "!"}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-2">
            {isLogin ? "Access your company resources" : "Join the resource portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">
              Email Address
            </label>
            <input 
              className={`w-full p-4 rounded-2xl bg-slate-50 border-2 ${
                errors.email ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-500'
              } focus:bg-white outline-none transition-all`}
              type="email" 
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">
              Password
            </label>
            <input 
              className={`w-full p-4 rounded-2xl bg-slate-50 border-2 ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-500'
              } focus:bg-white outline-none transition-all`}
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-2">{errors.password}</p>
            )}
            {!isLogin && !errors.password && (
              <p className="text-slate-400 text-[10px] mt-1 ml-2">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number
              </p>
            )}
          </div>

          {/* Role Selection (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">
                Select Your Role
              </label>
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={loading}
              >
                <option value="employee">Employee</option>
                <option value="manager">Department Manager</option>
                <option value="store">Store Manager</option>
              </select>
              <p className="text-slate-400 text-[10px] mt-1 ml-2">
                {formData.role === 'employee' && 'Request resources from inventory'}
                {formData.role === 'manager' && 'Approve/reject employee requests'}
                {formData.role === 'store' && 'Manage inventory and fulfill requests'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-xl shadow-indigo-100 mt-6 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ email: "", password: "", role: "employee" });
              setErrors({});
            }}
            disabled={loading}
            className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition disabled:opacity-50"
          >
            {isLogin 
              ? "Don't have an account? Create one" 
              : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
