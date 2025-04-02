import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // useNavigate is the correct hook for navigation
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

function Dashboard() {
  // const [role, setRole] = useState('');
  const navigate = useNavigate(); // Create a navigate object for navigation

  useEffect(() => {
    const token = Cookies.get('token'); // Check if JWT is stored in localStorage

    // If no token in localStorage, check the URL for token and store it in localStorage
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const wtoken = urlParams.get('token');
      if (wtoken) {
        localStorage.setItem('token', wtoken);  // Store the token in localStorage
        navigate(window.location.pathname);  // Reload to update state and handle navigation
      }
    } else {
      try {
        // Decode the JWT token to extract the role
        const decoded = jwtDecode(token);

        // Redirect based on the role using navigate
        if (decoded.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (decoded.role === 'manager') {
          navigate('/manager-dashboard');
        } else if (decoded.role === 'user') {
          navigate('/user-dashboard');
        }
      } catch (error) {
        console.error("Invalid token", error);
        handleLogout();
      }
    }
  }, [navigate]);


  const handleLogout = () => {
    Cookies.remove('token'); // Remove the token
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div>
      <h2>Loading Dashboard...</h2>
      {/* Optionally display loading text until redirected */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
