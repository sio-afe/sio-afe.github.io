import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from '../../shared/CountdownTimer';

const highlightImages = [
  '/assets/img/highlight5.jpeg',
  '/assets/img/highlight6.jpeg',
  '/assets/img/highlight7.jpeg',
  '/assets/img/highlight8.jpeg',
  '/assets/img/highlight9.jpeg'
];

const teamLogos = [
  { name: 'Al Hamd', logo: '/assets/data/open-age/team-logos/alhamd.jpeg' },
  { name: 'Eagle', logo: '/assets/data/open-age/team-logos/eagle.jpeg' },
  { name: 'Ekka', logo: '/assets/data/open-age/team-logos/ekka.jpeg' },
  { name: 'Guncha', logo: '/assets/data/open-age/team-logos/guncha.png' },
  { name: 'Haikyu', logo: '/assets/data/open-age/team-logos/haikyu.jpeg' },
  { name: 'Legends', logo: '/assets/data/open-age/team-logos/Legends.png' },
  { name: 'Real Ace', logo: '/assets/data/open-age/team-logos/realace.jpeg' },
  { name: 'Shine', logo: '/assets/data/open-age/team-logos/shine.jpeg' },
  { name: 'Tehreeki', logo: '/assets/data/open-age/team-logos/tehreeki.jpeg' },
  { name: 'THFC', logo: '/assets/data/open-age/team-logos/thfc.jpeg' },
  { name: 'Tikona', logo: '/assets/data/open-age/team-logos/tikona.jpeg' },
  { name: 'Uncommon', logo: '/assets/data/open-age/team-logos/uncommon.jpeg' },
  { name: 'Young Boys', logo: '/assets/data/open-age/team-logos/youngboys.jpeg' }
];

const editions = [
  {
    year: '2025',
    title: 'MUQAWAMA 2025',
    subtitle: 'More Than a Tournament. A Movement.',
    stats: [
      { number: '22', label: 'Teams' },
      { number: '200+', label: 'Players' },
      { number: '2', label: 'Days' }
    ],
    status: 'completed',
    statusLabel: 'Tournament Completed'
  },
  {
    year: '2026',
    title: 'MUQAWAMA 2026',
    subtitle: 'The Journey Continues...',
    countdownTarget: '2026-01-03T09:00:00+05:30',
    stats: [
      { number: 'Jan 3-4, 2026', label: 'Tournament Dates' }
    ],
    status: 'coming-soon',
    statusLabel: 'Coming Soon'
  }
];

function Hero({ selectedEdition, setSelectedEdition }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % highlightImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const editionIndex = selectedEdition === '2025' ? 0 : 1;
  const currentEdition = editions[editionIndex];

  return (
    <motion.div 
      id="home"
      className="hero-modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="hero-background">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={highlightImages[currentImageIndex]}
            alt="Muqawamah Tournament Highlights"
            className="hero-slideshow-image"
            loading="lazy"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content-modern">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Edition Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={editionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentEdition.status === 'completed' && (
                <div className="status-badge-hero completed">
                  <i className="fas fa-check-circle"></i> {currentEdition.statusLabel}
                </div>
              )}
              
              {currentEdition.status === 'coming-soon' && (
                <div className="status-badge-hero coming-soon">
                  <i className="fas fa-clock"></i> {currentEdition.statusLabel}
                </div>
              )}

              <h1 className="hero-title-modern">{currentEdition.title}</h1>
              <p className="hero-subtitle-modern">{currentEdition.subtitle}</p>

              {currentEdition.countdownTarget && (
                <CountdownTimer
                  targetDate={currentEdition.countdownTarget}
                  label="Kick-off begins in"
                  variant="hero"
                />
              )}
              
              <div className="hero-stats-modern">
                {currentEdition.stats.map((stat, index) => (
                  <div key={index} className="stat-box condensed">
                    <span className="stat-number">{stat.number}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Team Logos - 2025 Only (Below Stats) */}
          {selectedEdition === '2025' && (
            <motion.div 
              className="hero-team-logos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="team-logos-scroll">
                {teamLogos.map((team, index) => (
                  <motion.div
                    key={index}
                    className="team-logo-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                  >
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      title={team.name}
                      onError={(e) => {
                        e.target.src = '/assets/data/open-age/team-logos/default.png';
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slideshow Indicators */}
          <div className="slideshow-indicators">
            {highlightImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Hero;

