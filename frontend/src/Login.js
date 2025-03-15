import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css'; // We'll create a matching CSS file

function Login() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setIsGoogleScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup script on unmount
    };
  }, []);

  useEffect(() => {
    if (isGoogleScriptLoaded) {
      // Initialize Google Sign-In only after the script is loaded
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_AUTH, 
        callback: handleGoogleLogin,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-button'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }, [isGoogleScriptLoaded]);

  const handleLogin = async () => {
    if (!user.username || !user.password) {
      alert("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/login', user);
      // Get JWT token 
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const { data } = await axios.post('http://localhost:5000/google-login', {
        token: response.credential, // Google ID Token
      });
      // Get JWT token
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Log in to your account</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter your username" 
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="Enter your password" 
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        </div>
        
        <button 
          className={`login-button ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div id="google-button" className="google-button-container"></div>
        
        <div className="register-link">
          Don't have an account? <a href="/register">Register now</a>
        </div>
      </div>
    </div>
  );
}

export default Login;