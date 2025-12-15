import React, { useState, useEffect } from 'react';

export default function TournamentNavbar() {
  const [activeLink, setActiveLink] = useState('');
  const [category, setCategory] = useState('open-age');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Determine category from URL
    const path = window.location.pathname;
    if (path.includes('/u17/')) {
      setCategory('u17');
    } else {
      setCategory('open-age');
    }

    // Set active link based on current path
    if (path.includes('/fixtures')) {
      setActiveLink('fixtures');
    } else if (path.includes('/standings')) {
      setActiveLink('table');
    } else if (path.includes('/statistics')) {
      setActiveLink('statistics');
    } else if (path.includes('/teams')) {
      setActiveLink('teams');
    } else if (path.includes('/players')) {
      setActiveLink('players');
    }
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'MATCHES', href: `/muqawamah/2026/${category}/fixtures/`, key: 'fixtures' },
    { name: 'TABLE', href: `/muqawamah/2026/${category}/standings/`, key: 'table' },
    { name: 'STATISTICS', href: `/muqawamah/2026/${category}/statistics/`, key: 'statistics' },
    { name: 'TEAMS', href: `/muqawamah/2026/${category}/teams/`, key: 'teams' },
    { name: 'PLAYERS', href: `/muqawamah/2026/${category}/players/`, key: 'players' }
  ];

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      <nav className="tournament-navbar">
        <div className="tournament-navbar-container">
          {/* Desktop Logo - Left Side */}
          <a href="/muqawamah/2026/" className="tournament-navbar-logo desktop-only">
            <img src="/assets/img/muq_invert.png" alt="Muqawama" />
          </a>

          {/* Desktop Links */}
          <div className="tournament-navbar-links desktop-only">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={`tournament-nav-link ${activeLink === link.key ? 'active' : ''}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Back Arrow Button */}
          <button 
            className="navbar-back-button mobile-only"
            onClick={handleBack}
            aria-label="Go back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>

          {/* Mobile Center Logo */}
          <a href="/muqawamah/2026/" className="tournament-navbar-center-logo mobile-only">
            <img src="/assets/img/title_invert.png" alt="Muqawama Tournament" />
          </a>

          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <a href="/muqawamah/2026/" className="mobile-sidebar-logo">
            <img src="/assets/img/title_invert.png" alt="Muqawama Tournament" />
          </a>
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="mobile-sidebar-content">
          <div className="mobile-sidebar-links">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={`mobile-nav-link ${activeLink === link.key ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

