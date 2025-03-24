import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MusicTheme.css';

function Login() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  
  useEffect(() => {
    // Create floating music notes animation
    const createMusicNotes = () => {
      const container = document.querySelector('.music-notes');
      if (!container) return;
      
      const noteCount = 20;
      const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯'];
      
      container.innerHTML = '';
      
      for (let i = 0; i < noteCount; i++) {
        const note = document.createElement('div');
        note.className = 'music-note';
        note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        note.style.left = `${Math.random() * 100}%`;
        note.style.animationDuration = `${Math.random() * 10 + 10}s`;
        note.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(note);
      }
    };
    
    createMusicNotes();
    
    // Load Google sign-in script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setIsGoogleScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up
      const container = document.querySelector('.music-notes');
      if (container) {
        container.innerHTML = '';
      }
      
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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
        { theme: 'filled_black', size: 'large', width: '100%', text: 'signin_with', shape: 'pill' }
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
    <div className="music-auth-container">
      <div className="music-notes"></div>
      <div className="vinyl-decoration vinyl-top-left"></div>
      <div className="vinyl-decoration vinyl-bottom-right"></div>
      
      <div className="music-auth-card">
        <div className="music-auth-header">
          <h2>Welcome Back</h2>
          <div className="music-divider"></div>
          <p className="subtitle">Sign in to your FeenFeenFeen account</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter your username" 
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="music-input"
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
            className="music-input"
          />
        </div>
        
        <button 
          className={`music-button ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 
            <span className="loading-text">Signing In<span className="dots">...</span></span> : 
            'Sign In'
          }
        </button>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div id="google-button" className="google-button-container"></div>
        
        <div className="auth-link">
          Don't have an account? <a href="/register">Join Now</a>
        </div>
      </div>
    </div>
  );
}

export default Login;