import React from 'react';
import { motion } from 'framer-motion';

function About2026() {
  return (
    <section id="about" className="about-section-modern">
      <div className="container-modern">
        <motion.div
          className="section-header-modern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-modern">About MUQAWAMA 2026</h2>
          <p className="section-subtitle-modern">
            Coming Soon - The next chapter of our movement
          </p>
        </motion.div>

        <motion.div
          className="coming-soon-notice"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <i className="fas fa-calendar-alt"></i>
          <h3>Tournament Details Coming Soon</h3>
          <p>
            We're planning an even bigger and better Muqawamah experience for 2026. 
            Stay tuned for dates, registration details, and exciting new features!
          </p>
          <button className="register-btn disabled" disabled>
            <i className="fas fa-lock"></i>
            Registration Opening Soon
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default About2026;

