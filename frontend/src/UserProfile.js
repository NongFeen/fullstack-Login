import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./UserDashboard.css"; // Using existing CSS

function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    email: "",
    age: "",
    tel: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Decode JWT token to verify user identity
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);

      // Fetch Profile from API
      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            "https://feenfeenfeen.online/api/user/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Verify that profile data matches current user
          if (
            decoded.username &&
            response.data.email &&
            decoded.username !== response.data.email &&
            decoded.role !== "admin"
          ) {
            setError("You are not authorized to view this profile");
            setLoading(false);
            return;
          }

          setProfile({
            name: response.data.name || "",
            surname: response.data.surname || "",
            email: response.data.email || "",
            age: response.data.age || "",
            tel: response.data.tel || "",
          });
          setLoading(false);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile data");
          setLoading(false);
        }
      };

      fetchProfile();
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "age" ? (value === "" ? "" : parseInt(value) || "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateSuccess(false);

    const token = localStorage.getItem("token");

    // Verify user is not changing email unless they're an admin
    if (
      decodedToken &&
      decodedToken.username &&
      profile.email !== decodedToken.username &&
      decodedToken.role !== "admin"
    ) {
      setError("You cannot change the email to a different user");
      setLoading(false);
      return;
    }

    try {
      await axios.put("https://feenfeenfeen.online/api/user/profile", profile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUpdateSuccess(true);
      setLoading(false);

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error updating profile:", err);

      // Display error message from server if available
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update profile data");
      }

      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  // If unauthorized access
  if (error && error.includes("not authorized")) {
    return (
      <div className="music-dashboard user-dashboard">
        <div className="dashboard-content">
          <div className="error-state">
            <div className="error-icon">🔒</div>
            <h2>Access Denied</h2>
            <p>{error}</p>
            <button className="secondary-button" onClick={handleGoBack}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="music-dashboard user-dashboard">
        <div className="dashboard-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="music-dashboard user-dashboard">
        <div className="dashboard-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="secondary-button" onClick={handleGoBack}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-dashboard user-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>FeenFeenFeen</h2>
          <div className="user-badge">MY MUSIC</div>
        </div>

        <div className="dashboard-nav">
          <button className="nav-item" onClick={handleGoBack}>
            Dashboard
          </button>
          <button className="nav-item active">Edit Profile</button>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Edit Your Profile</h1>
          <p>Update your personal information</p>
        </div>

        <div className="dashboard-section">
          <div className="profile-card">
            {updateSuccess && (
              <div className="success-message">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">First Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="music-input"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Last Name</label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    value={profile.surname}
                    onChange={handleChange}
                    className="music-input"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="music-input"
                  placeholder="Enter your email"
                  required
                  disabled={decodedToken && decodedToken.role !== "admin"} // Only admin can edit email
                />
                {decodedToken && decodedToken.role !== "admin" && (
                  <small className="form-text">Email cannot be changed</small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    className="music-input"
                    placeholder="Enter your age"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tel">Phone Number</label>
                  <input
                    type="tel"
                    id="tel"
                    name="tel"
                    value={profile.tel}
                    onChange={handleChange}
                    className="music-input"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleGoBack}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
