// frontend/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MusicTheme.css';

function Login() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const token = urlParams.get('token');
    // if (token) {
    //   localStorage.setItem('token', token);
    //   navigate('/dashboard');
    // }
  }, [navigate]);
  
  const handleGoogleLogin = () => {
    // window.location.href = 'https://feenfeenfeen.online/api/auth/google';
    window.location.href = 'http://localhost:5000/auth/google';

  };

  const handleLogin = async () => {
    if (!user.username || !user.password) {
      alert("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    // const { data } = await axios.post('https://feenfeenfeen.online/api/login', user);
    try {
      const { data } = await axios.post('http://localhost:5000/login', 
        user, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      // localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="music-auth-container">
      <div className="music-auth-card">
        <div className="music-auth-header">
          <h2>Login</h2>
          <div className="music-divider"></div>
          <p className="subtitle">Sign in to FeenFeenFeen</p>
        </div>
        
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Enter your email" 
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="music-input"
          />
        </div>
        
        <div className="form-group">
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="music-input"
          />
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="music-button"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="divider">
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          className="music-button google-button"
        >
          Sign in with Google
        </button>
        
        <div className="auth-link">
          Don't have an account? <a href="/register">Register Now</a>
        </div>
      </div>
    </div>
  );
}

export default Login;