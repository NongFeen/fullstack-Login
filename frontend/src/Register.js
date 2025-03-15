import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // You'll need to create this CSS file

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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create an Account</h2>
          <p className="subtitle">Join our platform to get started</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter your username" 
            value={user.username}
            onChange={e => setUser({...user, username: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="Create a strong password" 
            value={user.password}
            onChange={e => setUser({...user, password: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select 
            id="role"
            value={user.role}
            onChange={e => setUser({...user, role: e.target.value})}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        
        <button 
          className={`register-button ${loading ? 'loading' : ''}`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register Now'}
        </button>
        
        <div className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
export default Register;