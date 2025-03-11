import './app.module.css';

import { Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import AdminDashboard from './admin-dashboard';
import ManagerDashboard from './manager-dashboard';
import UserDashboard from './user-dashboard';
import Login from './login';
import Register from './register';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <h1>Welcome to the Dashboard</h1>
            <p>Please login to access the dashboard</p>
            <a style={{ marginRight: '10px' }} href="/login">
              Login
            </a>
            <a href="/register">Register</a>
          </div>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

export default App;
