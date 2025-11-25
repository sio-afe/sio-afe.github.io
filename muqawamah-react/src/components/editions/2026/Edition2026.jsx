import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../2025/Hero';
import AboutSection from '../2025/AboutSection';
import RulesSection from '../2025/RulesSection';
import SponsorsSection from '../2025/SponsorsSection';
import FindImagesSection from '../2025/FindImagesSection';
import SocialSection from '../2025/SocialSection';

function Edition2026({ setSelectedEdition }) {
  return (
    <motion.div
      key="2026-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero selectedEdition="2026" setSelectedEdition={setSelectedEdition} />
      <AboutSection edition="2026" />
      <RulesSection edition="2026" />
      <FindImagesSection edition="2026" />
      <SocialSection edition="2026" />
      <SponsorsSection edition="2026" />
    </motion.div>
  );
}

export default Edition2026;

