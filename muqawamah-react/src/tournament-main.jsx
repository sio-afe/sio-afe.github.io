import React from 'react';
import ReactDOM from 'react-dom/client';
import Tournament from './components/editions/2025/Tournament';
import './styles/App.css';

ReactDOM.createRoot(document.getElementById('tournament-root')).render(
  <React.StrictMode>
    <Tournament />
  </React.StrictMode>
);

