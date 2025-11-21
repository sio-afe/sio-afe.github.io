import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/shared/Navbar';
import Edition2025 from './components/editions/2025/Edition2025';
import Edition2026 from './components/editions/2026/Edition2026';

function App() {
  const [selectedEdition, setSelectedEdition] = useState('2025');

  React.useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.info-section');
    sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [selectedEdition]);

  return (
    <div className="tournament-container">
      <Navbar selectedEdition={selectedEdition} setSelectedEdition={setSelectedEdition} />
      
      <AnimatePresence mode="wait">
        {selectedEdition === '2025' ? (
          <Edition2025 key="2025" setSelectedEdition={setSelectedEdition} />
        ) : (
          <Edition2026 key="2026" setSelectedEdition={setSelectedEdition} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

