import React from 'react';
import ReactDOM from 'react-dom/client';
import Tournament2025 from './components/editions/2025/Tournament';
import Tournament2026 from './components/editions/2026/Tournament';
import './styles/App.css';

// Detect edition from URL
const edition = window.location.pathname.match(/\/muqawamah\/(\d{4})\//)?.[1] || '2025';
const TournamentComponent = edition === '2026' ? Tournament2026 : Tournament2025;

ReactDOM.createRoot(document.getElementById('tournament-root')).render(
  <React.StrictMode>
    <TournamentComponent />
  </React.StrictMode>
);

