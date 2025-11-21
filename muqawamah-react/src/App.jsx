import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import RulesSection from './components/RulesSection';
import CTASection from './components/CTASection';
import SponsorsSection from './components/SponsorsSection';
import FindImagesSection from './components/FindImagesSection';
import SocialSection from './components/SocialSection';

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
        <motion.div
          key={selectedEdition}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Hero selectedEdition={selectedEdition} setSelectedEdition={setSelectedEdition} />
          <AboutSection edition={selectedEdition} />
          <RulesSection edition={selectedEdition} />
          <CTASection edition={selectedEdition} />
          <SponsorsSection edition={selectedEdition} />
          <FindImagesSection edition={selectedEdition} />
          <SocialSection edition={selectedEdition} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;

