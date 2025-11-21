import React from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import AboutSection from './AboutSection';
import RulesSection from './RulesSection';
import CTASection from './CTASection';
import SponsorsSection from './SponsorsSection';
import FindImagesSection from './FindImagesSection';
import SocialSection from './SocialSection';

function Edition2025({ setSelectedEdition }) {
  return (
    <motion.div
      key="2025-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero selectedEdition="2025" setSelectedEdition={setSelectedEdition} />
      <AboutSection edition="2025" />
      <RulesSection edition="2025" />
      <CTASection edition="2025" />
      <SponsorsSection edition="2025" />
      <FindImagesSection edition="2025" />
      <SocialSection edition="2025" />
    </motion.div>
  );
}

export default Edition2025;

