import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Call your backend to validate token
          await axios.get('https://obc.work.gd/api/validate-token/', {
            headers: { 'Authorization': `Token ${token}` }
          });
          // Token is valid, continue
        } catch (error) {
          console.error('Token validation error:', error);
          // Token is invalid, clear it and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };
    
    validateToken();
  }, []);

  const login = (newToken) => {
    // Store in both state and localStorage
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    // Clear from both state and localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };