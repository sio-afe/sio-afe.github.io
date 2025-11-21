import React from 'react';
import { motion } from 'framer-motion';

function Hero2026({ setSelectedEdition }) {
  return (
    <motion.div 
      id="home"
      className="hero-modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content-modern">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Edition Toggle Switch */}
          <div className="hero-edition-toggle">
            <span 
              className="hero-edition-label"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedEdition('2025');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              2025
            </span>
            <div 
              className="hero-toggle-switch"
              onClick={() => {
                setSelectedEdition('2025');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="hero-toggle-slider active"></div>
            </div>
            <span className="hero-edition-label active">
              2026
            </span>
          </div>

          {/* 2026 Coming Soon Content */}
          <div className="status-badge-hero coming-soon">
            <i className="fas fa-clock"></i> Coming Soon
          </div>

          <h1 className="hero-title-modern">MUQAWAMA 2026</h1>
          <p className="hero-subtitle-modern">The Journey Continues...</p>
          
          <div className="hero-stats-modern">
            <div className="stat-box">
              <span className="stat-number">TBA</span>
              <span className="stat-label">Teams</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">TBA</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">TBA</span>
              <span className="stat-label">Days</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Hero2026;

