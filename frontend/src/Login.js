import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SciFiAuth.css'; // We'll use the same CSS file for both pages

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
    <div className="scifi-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="scifi-card">
        <div className="scifi-header">
          <h2>Station Access</h2>
          <div className="scifi-divider"></div>
          <p className="subtitle">Authentication Protocol</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">User Identifier</label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter identifier code" 
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="scifi-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Access Key</label>
          <input 
            id="password"
            type="password" 
            placeholder="Enter security key" 
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="scifi-input"
          />
        </div>
        
        <button 
          className={`scifi-button ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 
            <span className="loading-text">Authenticating<span className="dots">...</span></span> : 
            'Access Terminal'
          }
        </button>
        
        <div className="scifi-divider alt">
          <span>OR</span>
        </div>
        
        <div id="google-button" className="google-button-container"></div>
        
        <div className="auth-link">
          No access? <a href="/register">Initialize New User</a>
        </div>
      </div>
    </div>
  );
}

export default Login;