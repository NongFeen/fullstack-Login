import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  useEffect(() => {
    function uiRandom() {
      return Math.random();
    }

    // Create floating music notes animation effect
    const createMusicNotes = () => {
      const container = document.querySelector(".landing-container");
      if (!container) return;

      // Clear any existing notes
      const existingNotes = document.querySelectorAll(".music-note");
      existingNotes.forEach((note) => note.remove());

      const noteCount = 30;
      const noteSymbols = ["♪", "♫", "♬", "♩", "♭", "♮", "♯"];

      for (let i = 0; i < noteCount; i++) {
        const note = document.createElement("div");
        note.className = "music-note";
        note.textContent =
          noteSymbols[Math.floor(uiRandom() * noteSymbols.length)];
        note.style.left = `${uiRandom() * 100}%`;
        note.style.bottom = `-50px`;
        note.style.animationDuration = `${uiRandom() * 10 + 10}s`;
        note.style.animationDelay = `${uiRandom() * 5}s`;
        container.appendChild(note);
      }
    };

    // Create equalizer bars
    const createEqualizer = () => {
      const equalizer = document.querySelector(".equalizer");
      if (!equalizer) return;

      equalizer.innerHTML = "";
      const barCount = 20;

      for (let i = 0; i < barCount; i++) {
        const bar = document.createElement("div");
        bar.className = "equalizer-bar";
        // Safe use: Random animation timing for visual effect only
        bar.style.animationDuration = `${uiRandom() * 1 + 0.5}s`;
        bar.style.animationDelay = `${uiRandom() * 0.5}s`;
        equalizer.appendChild(bar);
      }
    };

    createMusicNotes();
    createEqualizer();

    // Cleanup function
    return () => {
      const container = document.querySelector(".landing-container");
      if (container) {
        const notes = document.querySelectorAll(".music-note");
        notes.forEach((note) => note.remove());
      }
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Music notes will be added by JS */}
      <div className="equalizer"></div>
      <div className="vinyl-record"></div>

      <div className="landing-content">
        <h1 className="title">
          <span className="glow">FEENFEENFEEN</span>
        </h1>

        <p className="subtitle">Your gateway to musical excellence</p>

        <div className="auth-buttons">
          <button className="neon-button" onClick={handleLoginClick}>
            SIGN IN
          </button>
          <button className="neon-button" onClick={handleRegisterClick}>
            JOIN NOW
          </button>
        </div>
      </div>

      <svg
        className="headphones"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 10C29.5 10 13 26.5 13 47v20h12V47c0-13.8 11.2-25 25-25s25 11.2 25 25v20h12V47C87 26.5 70.5 10 50 10z"
          stroke="#ff0055"
          strokeWidth="4"
        />
        <path
          d="M13 67c-5 0-9 4-9 9v8c0 5 4 9 9 9h8V67h-8zM87 67c5 0 9 4 9 9v8c0 5-4 9-9 9h-8V67h8z"
          fill="#ff0055"
        />
      </svg>
    </div>
  );
}

export default LandingPage;
