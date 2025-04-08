import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user info from server (based on cookie)
    axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(response => {
        const role = response.data.role;

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'manager') {
          navigate('/manager-dashboard');
        } else if (role === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/login');
        }
      })
      .catch(error => {
        console.error("User not authenticated", error);
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    axios.get('http://localhost:5000/logout', { withCredentials: true })
      .then(() => navigate('/login'))
      .catch(() => navigate('/login'));
  };

  return (
    <div>
      <h2>{loading ? 'Loading Dashboard...' : 'Redirecting...'}</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
