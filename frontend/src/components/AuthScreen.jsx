import React, { useState } from 'react';
import axios from 'axios';

const AuthScreen = ({ onLoginSuccess, setMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee" // Default role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Your backend endpoints
    const endpoint = isLogin ? "/api/login" : "/api/signup";
    
    try {
      const res = await axios.post(`http://localhost:8080${endpoint}`, formData);
      
      if (isLogin) {
        // 1. Save Token to LocalStorage for persistence
        localStorage.setItem("token", res.data.token);
        // 2. Save User Info (Email and Role)
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // 3. Update App State
        onLoginSuccess(res.data.user);
        setMessage({ text: "Login successful!", type: "success" });
      } else {
        setMessage({ text: "Account created! You can now login.", type: "success" });
        setIsLogin(true); // Switch to login view after successful signup
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || "Authentication failed", 
        type: "error" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg shadow-indigo-200">
            {isLogin ? "🔐" : "🚀"}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-2">
            {isLogin ? "Access your company resources" : "Join the resource portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Email Address</label>
            <input 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all"
              type="email" 
              placeholder="name@company.com" 
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Password</label>
            <input 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all"
              type="password" 
              placeholder="••••••••" 
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Assign Role</label>
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="employee">Employee</option>
                <option value="manager">Department Manager</option>
                <option value="store">Store Manager</option>
              </select>
            </div>
          )}

          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4">
            {isLogin ? "Sign In" : "Register Now"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition"
          >
            {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;