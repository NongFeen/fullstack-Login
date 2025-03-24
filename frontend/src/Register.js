import React, { useState } from 'react';
import axios from 'axios';
import './SciFiAuth.css'; // We'll create a shared CSS file for both pages

function Register() {
  const [user, setUser] = useState({ username: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!user.username || !user.password) {
      alert("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      console.log("trying to register");
      await axios.post('http://localhost:5000/register', user);
      alert("Registration successful! Please login.");
      window.location.href = '/login';
    } catch (error) {
      console.error('Registration error:', error);
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="scifi-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="scifi-card">
        <div className="scifi-header">
          <h2>Create Station Access</h2>
          <div className="scifi-divider"></div>
          <p className="subtitle">Initialize New User Protocol</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">User Identifier</label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter identifier code" 
            value={user.username}
            onChange={e => setUser({...user, username: e.target.value})} 
            className="scifi-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Access Key</label>
          <input 
            id="password"
            type="password" 
            placeholder="Create security key" 
            value={user.password}
            onChange={e => setUser({...user, password: e.target.value})} 
            className="scifi-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Clearance Level</label>
          <select 
            id="role"
            value={user.role}
            onChange={e => setUser({...user, role: e.target.value})}
            className="scifi-select"
          >
            <option value="user">Standard User</option>
            <option value="admin">Admin Access</option>
            <option value="manager">Operations Manager</option>
          </select>
        </div>
        
        <button 
          className={`scifi-button ${loading ? 'loading' : ''}`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 
            <span className="loading-text">Initializing<span className="dots">...</span></span> : 
            'Register User'
          }
        </button>
        
        <div className="auth-link">
          Already registered? <a href="/login">Access Terminal</a>
        </div>
      </div>
    </div>
  );
}

export default Register;