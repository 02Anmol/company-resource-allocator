import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('token_expires');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/';
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Access denied: Insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if token is expired
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('token_expires');
  
  if (!expiresAt) {
    return true;
  }
  
  return new Date(expiresAt) < new Date();
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token && !isTokenExpired();
};

// Helper function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('token_expires');
  localStorage.removeItem('user');
};

export default api;
