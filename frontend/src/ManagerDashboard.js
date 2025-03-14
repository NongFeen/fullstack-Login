import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate for navigation
import { jwtDecode } from 'jwt-decode'; // JWT decoding to verify token

function ManagerDashboard() {
  const navigate = useNavigate(); // Initialize navigate hook for redirection
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token found, redirect to login
        navigate('/login');
      } else {
        try {
          // Verify token (decode and check expiration if needed)
          const decoded = jwtDecode(token);
          if(decoded.role !== 'manager'){
            localStorage.removeItem('token')
            navigate('/login');
          }
        } catch (error) {
          // If token is invalid, redirect to login
          navigate('/login');
        }
      }
    }, [navigate]);
  
    const handleLogout = () => {
      localStorage.removeItem('token'); // Remove token from localStorage
      navigate('/login'); // Redirect to login page
    };

  return (
    <div>
      <h2>Manager Dashboard</h2>
      <p>Welcome Manager! You have limited admin access.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ManagerDashboard;
