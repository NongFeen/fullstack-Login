import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './UserDashboard.css'; // Using same CSS file

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    email: '',
    age: '',
    tel: ''
  });
  const [isEditing, setIsEditing] = useState(true);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('https://feenfeenfeen.online/auth/me', {
          // await axios.get('https://feenfeenfeen.online/api/auth/me', {
          withCredentials: true
        });
  
        const { username } = response.data;
        setUsername(username || 'User');
        fetchUserProfile(); // fetch without token
      } catch (error) {
        console.error('Token or session error:', error);
        // localStorage.removeItem('token'); // no need if you're not using localStorage anymore
        // navigate('/login');
      }
    };
  
    fetchUserInfo();
  },);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://feenfeenfeen.online/user/profile', {
        withCredentials: true,  // Ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json', // Set the correct content type
        }
      });
      // Set profile data, handling null values
      const profileData = response.data;
      setProfile({
        name: profileData.name || '',
        surname: profileData.surname || '',
        email: profileData.email || '',
        age: profileData.age || '',
        tel: profileData.tel || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      const response = await axios.put(
        'https://feenfeenfeen.online/user/profile',
        profile,
        {
          withCredentials: true, // This sends the cookie along with the request
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        setSuccess('Profile updated successfully!');
        // setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
  
      if (err.response) {
        setError(err.response.data?.message || 'Server error. Please try again.');
      } else if (err.request) {
        setError('No response from server. Check your network.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    fetchUserProfile(); // Refetch profile using cookie-auth
    // setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="music-dashboard user-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>FeenFeenFeen</h2>
          <div className="user-badge">MY MUSIC</div>
        </div>
        
        <div className="dashboard-nav">
          <button className="nav-item" onClick={() => navigate('/user-dashboard')}>
            Browse Music
          </button>
          <button className="nav-item" onClick={() => navigate('/user-dashboard')}>
            Cart
          </button>
          <button className="nav-item" onClick={() => navigate('/user-dashboard')}>
            My Orders
          </button>
          <button className="nav-item active">
            Profile
          </button>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Profile</h1>
          <p>Update your personal information</p>
        </div>
        
        <div className="dashboard-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.name ? profile.name.charAt(0).toUpperCase() : username.charAt(0).toUpperCase()}
              </div>
              <div className="profile-name">
                <h3>{profile.name ? `${profile.name} ${profile.surname}` : username}</h3>
                <p className="profile-role">Music Enthusiast</p>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">Loading profile...</div>
            ) : (
              <>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="music-input"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="surname"
                        value={profile.surname}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="music-input"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="music-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        name="age"
                        value={profile.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="music-input"
                        placeholder="Enter your age"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="tel"
                        value={profile.tel}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="music-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="profile-actions">
                    {isEditing ? (
                      <>
                        <button type="submit" className="update-button">Save Changes</button>
                        <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
                      </>
                    ) : (
                      <button 
                        type="button" 
                        className="edit-button" 
                        // onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
                
                <div className="profile-section">
                  <h4>Account Settings</h4>
                  <div className="form-group">
                    <label>Email Notifications</label>
                    <div className="toggle-switch">
                      <input type="checkbox" id="notifications" defaultChecked />
                      <label htmlFor="notifications"></label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Change Password</label>
                    <button className="secondary-button">Update Password</button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="membership-card">
            <h3>Membership Status</h3>
            <div className="membership-badge">Standard</div>
            <p>Joined: March 2025</p>
            <ul className="membership-benefits">
              <li>Free shipping on orders over $50</li>
              <li>Early access to new releases</li>
              <li>Exclusive member-only discounts</li>
              <li>Personalized recommendations</li>
            </ul>
            <button className="upgrade-button">Upgrade to Premium</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;