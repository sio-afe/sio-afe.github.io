import React from 'react';
import { motion } from 'framer-motion';
import Hero2026 from './Hero2026';
import About2026 from './About2026';
import Tournaments2026 from './Tournaments2026';
import Social2026 from './Social2026';

function Edition2026({ setSelectedEdition }) {
  return (
    <motion.div
      key="2026-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero2026 setSelectedEdition={setSelectedEdition} />
      <About2026 />
      <Tournaments2026 />
      <Social2026 />
    </motion.div>
  );
}

export default Edition2026;

