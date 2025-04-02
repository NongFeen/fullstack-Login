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
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [navigate]);
  
  const handleGoogleLogin = () => {
    window.location.href = 'https://feenfeenfeen.online/api/auth/google';
  };

  const handleLogin = async () => {
    if (!user.username || !user.password) {
      alert("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post('https://feenfeenfeen.online/api/login', user);
      localStorage.setItem('token', data.token);
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
      <h1>Login</h1>
      <input 
        type="text" 
        placeholder="Enter your email" 
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />
      <input 
        type="password" 
        placeholder="Enter your password" 
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <button onClick={handleLogin} disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
      <div>OR</div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
}

export default Login;