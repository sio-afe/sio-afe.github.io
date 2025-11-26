import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Navbar({ selectedEdition, setSelectedEdition }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '/muqawamah/about/', isExternal: true },
    { name: 'Rules', href: '/muqawamah/terms-and-conditions/', isExternal: true },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '/muqawamah/contact/', isExternal: true }
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img src="/assets/img/title_invert.png" alt="Muqawama" className="logo-img" />
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="nav-link"
              onClick={(e) => {
                if (link.isExternal) {
                  // Allow default navigation for external links
                  return;
                }
                e.preventDefault();
                const element = document.querySelector(link.href);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {link.name}
              {link.badge && <span className="nav-badge">{link.badge}</span>}
            </a>
          ))}
        </div>

        {/* Edition Selector - Toggle Switch */}
        <div className="edition-toggle-container">
          <span className={`edition-label ${selectedEdition === '2025' ? 'active' : ''}`}>2025</span>
          <div 
            className="toggle-switch"
            onClick={() => {
              const newEdition = selectedEdition === '2025' ? '2026' : '2025';
              window.location.href = `/muqawamah/${newEdition}/`;
            }}
          >
            <div className={`toggle-slider ${selectedEdition === '2026' ? 'active' : ''}`}></div>
          </div>
          <span className={`edition-label ${selectedEdition === '2026' ? 'active' : ''}`}>
            2026
            {selectedEdition !== '2026' && <span className="soon-indicator">Soon</span>}
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="mobile-nav-link"
              onClick={(e) => {
                if (link.isExternal) {
                  // Allow default navigation for external links
                  setMobileMenuOpen(false);
                  return;
                }
                e.preventDefault();
                const element = document.querySelector(link.href);
                element?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
            >
              {link.name}
              {link.badge && <span className="nav-badge">{link.badge}</span>}
            </a>
          ))}
          <div className="mobile-editions">
            <div className="edition-toggle-container mobile">
              <span className={`edition-label ${selectedEdition === '2025' ? 'active' : ''}`}>2025</span>
              <div 
                className="toggle-switch"
                onClick={() => {
                  const newEdition = selectedEdition === '2025' ? '2026' : '2025';
                  window.location.href = `/muqawamah/${newEdition}/`;
                }}
              >
                <div className={`toggle-slider ${selectedEdition === '2026' ? 'active' : ''}`}></div>
              </div>
              <span className={`edition-label ${selectedEdition === '2026' ? 'active' : ''}`}>
                2026
                {selectedEdition !== '2026' && <span className="soon-indicator">Soon</span>}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;

