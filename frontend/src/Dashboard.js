import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie'; // Import the useCookies hook

function Dashboard() {
  const navigate = useNavigate();
  
  // Use the useCookies hook to manage cookies in React
  const [cookies, setCookie, removeCookie] = useCookies(["Feentoken"]);  
  console.log(cookies.Feentoken);
  const redirectUser = useCallback((role) => {
    const roleRoutes = {
      admin: '/admin-dashboard',
      manager: '/manager-dashboard',
      user: '/user-dashboard',
    };
    navigate(roleRoutes[role] || '/login');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    removeCookie("Feentoken");  // Remove token from cookies
    navigate('/login');
  }, [navigate, removeCookie]);

  useEffect(() => {
    let token = cookies.Feentoken;  // Access token from cookies
    console.log(cookies.Feentoken);
    if (!token) {
      console.log("no Token");
    } else {
      try {
        const decoded = jwtDecode(token);
        redirectUser(decoded.role);
      } catch (error) {
        console.error('Invalid token', error);
        handleLogout();
      }
    }
  }, [cookies, navigate, handleLogout, redirectUser, setCookie]); // Added cookies as dependency to trigger effect on cookie change

  return (
    <div>
      <h2>Loading Dashboard...</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
