import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MusicTheme.css";

function Register() {
  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create floating music notes
    const createMusicNotes = () => {
      const container = document.querySelector(".music-notes");
      if (!container) return;

      let seedValue = 42;
      function deterministicRandom() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      }

      const noteCount = 20;
      const noteSymbols = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"];

      container.innerHTML = "";

      for (let i = 0; i < noteCount; i++) {
        const note = document.createElement("div");
        note.className = "music-note";
        note.textContent =
          noteSymbols[Math.floor(deterministicRandom() * noteSymbols.length)];
        note.style.left = `${deterministicRandom() * 100}%`;
        note.style.animationDuration = `${deterministicRandom() * 10 + 10}s`;
        note.style.animationDelay = `${deterministicRandom() * 5}s`;
        container.appendChild(note);
      }
    };

    createMusicNotes();

    // Cleanup
    return () => {
      const container = document.querySelector(".music-notes");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  const handleRegister = async () => {
    if (!user.username || !user.password) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log("trying to register");
      const response = await axios.post(
        "http://localhost:5000/register",
        user,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Registration successful! Please login.");
      window.location.href = "/login";
    } catch (error) {
      console.error("Registration error:", error);

      // Try to show message from backend, else default error
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="music-auth-container">
      <div className="music-notes"></div>
      <div className="vinyl-decoration vinyl-top-left"></div>
      <div className="vinyl-decoration vinyl-bottom-right"></div>

      <div className="music-auth-card">
        <div className="music-auth-header">
          <h2>Join the Beat</h2>
          <div className="music-divider"></div>
          <p className="subtitle">Create your FeenFeenFeen account</p>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="music-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a secure password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="music-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
            className="music-select"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <button
          className={`music-button ${loading ? "loading" : ""}`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-text">
              Creating Account<span className="dots">...</span>
            </span>
          ) : (
            "Join Now"
          )}
        </button>

        <div className="auth-link">
          Already have an account? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
