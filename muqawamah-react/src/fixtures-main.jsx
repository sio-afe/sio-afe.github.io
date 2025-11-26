import React from 'react';
import ReactDOM from 'react-dom/client';
import Fixtures from './components/editions/2026/fixtures/Fixtures';
import './styles/Fixtures.css';
import './styles/TournamentNavbar.css';

ReactDOM.createRoot(document.getElementById('fixtures-root')).render(
  <React.StrictMode>
    <Fixtures />
  </React.StrictMode>
);


