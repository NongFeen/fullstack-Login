import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  useEffect(() => {
    // Create stars animation effect
    const createStars = () => {
      const container = document.querySelector('.star-container');
      if (!container) return;
      
      container.innerHTML = '';
      const starCount = 100;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 10 + 5}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
      }
    };
    
    createStars();
  }, []);

  return (
    <div className="landing-container">
      <div className="star-container"></div>
      <div className="meteor"></div>
      <div className="landing-content">
        <div className="spaceship"></div>
        <div className="planet"></div>
        
        <h1 className="title">
          <span className="glow">STELLAR</span> GATEWAY
        </h1>
        
        <p className="subtitle">Navigate the digital universe</p>
        
        <div className="auth-buttons">
          <button className="neon-button" onClick={handleLoginClick}>
            INITIATE ACCESS
          </button>
          <button className="neon-button" onClick={handleRegisterClick}>
            CREATE IDENTITY
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;