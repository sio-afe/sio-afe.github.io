import React from 'react';
import { motion } from 'framer-motion';

function Tournaments2026() {
  return (
    <section id="tournaments" className="cta-section-modern">
      <div className="container-modern">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title-modern">Tournament Categories</h2>
          
          <motion.div
            className="coming-soon-tournaments"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <i className="fas fa-futbol fa-3x" style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}></i>
            <p>Tournament categories and registration details will be announced soon!</p>
          </motion.div>

          <motion.p
            className="cta-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            More information coming soon
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default Tournaments2026;

