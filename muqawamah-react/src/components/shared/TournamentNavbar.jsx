import React, { useState, useEffect } from 'react';

export default function TournamentNavbar() {
  const [activeLink, setActiveLink] = useState('');
  const [category, setCategory] = useState('open-age');

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

  const navLinks = [
    { name: 'MATCHES', href: `/muqawamah/2026/${category}/fixtures/`, key: 'fixtures' },
    { name: 'TABLE', href: `/muqawamah/2026/${category}/standings/`, key: 'table' },
    { name: 'STATISTICS', href: `/muqawamah/2026/${category}/statistics/`, key: 'statistics' },
    { name: 'TEAMS', href: `/muqawamah/2026/${category}/teams/`, key: 'teams' },
    { name: 'PLAYERS', href: `/muqawamah/2026/${category}/players/`, key: 'players' }
  ];

  return (
    <nav className="tournament-navbar">
      <div className="tournament-navbar-container">
        <a href="/muqawamah/2026/" className="tournament-navbar-logo">
          <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" />
        </a>
        
        <div className="tournament-navbar-links">
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
      </div>
    </nav>
  );
}

