import React from 'react';
import ReactDOM from 'react-dom/client';
import TeamRegistration from './components/shared/registration/TeamRegistration';
import './styles/App.css';
import './styles/Registration.css';

ReactDOM.createRoot(document.getElementById('registration-root')).render(
  <React.StrictMode>
    <TeamRegistration />
  </React.StrictMode>
);

