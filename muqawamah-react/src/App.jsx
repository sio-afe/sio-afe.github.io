import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Edition2025 from './components/editions/2025/Edition2025';
import Edition2026 from './components/editions/2026/Edition2026';

// Sponsors for each edition
const sponsors2025 = [
  { name: 'Shaheen Academy', image: '/assets/data/sponsors/shaheen-academy.png' },
  { name: 'Hidayat Publishers', image: '/assets/data/sponsors/hidayat.png' },
  { name: 'Oceans Secret', image: '/assets/data/sponsors/ocean.png' },
  { name: 'White Dot Publishers', image: '/assets/data/sponsors/whitedot.jpeg' },
  { name: 'Bazmi PG', image: '/assets/data/sponsors/bazmi.jpeg' },
  { name: 'Dr Lal Hospital', image: '/assets/data/sponsors/motilal.png' },
  { name: 'Shaheen Public School', image: '/assets/data/sponsors/sps.jpeg' },
  { name: 'Nadeem Contractor', image: '/assets/data/sponsors/nadeem.jpeg' },
  { name: 'Jabbar Contractor', image: '/assets/data/sponsors/jabbar.png' },
  { name: 'Zavia Prints', image: '/assets/data/sponsors/zavia.png' }
];

// 2026 sponsors - update this array with actual 2026 sponsors
const sponsors2026 = [
  // Add 2026 sponsors here when available
];

function App() {
  // Detect edition from URL
  const urlEdition = window.location.pathname.includes('/2026/') ? '2026' : '2025';
  const [selectedEdition, setSelectedEdition] = useState(urlEdition);

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
      
      <Footer 
        sponsors={selectedEdition === '2025' ? sponsors2025 : sponsors2026} 
        edition={selectedEdition} 
      />
    </div>
  );
}

export default App;

