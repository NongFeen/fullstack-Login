import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./ManagerDashboard";
import UserDashboard from "./UserDashboard";
import Login from "./Login";
import Register from "./Register";
import LandingPage from "./LandingPage";
import UserProfile from "./UserProfile";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;