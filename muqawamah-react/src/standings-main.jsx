import React from 'react';
import ReactDOM from 'react-dom/client';
import Standings from './components/editions/2026/standings/Standings';
import './styles/Standings.css';
import './styles/TournamentNavbar.css';

ReactDOM.createRoot(document.getElementById('standings-root')).render(
  <React.StrictMode>
    <Standings />
  </React.StrictMode>
);


