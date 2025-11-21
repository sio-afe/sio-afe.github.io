import React from 'react';
import { motion } from 'framer-motion';

function Social2026() {
  return (
    <section id="contact" className="social-section-modern">
      <div className="container-modern">
        <motion.div
          className="section-header-modern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-modern">Stay Connected</h2>
          <p className="section-subtitle-modern">
            Follow us for updates on Muqawamah 2026
          </p>
        </motion.div>
        
        <motion.div
          className="social-links-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            gap: '30px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '3rem'
          }}
        >
          <a 
            href="https://instagram.com/muqawamah" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="social-link-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fab fa-instagram" style={{ fontSize: '24px' }}></i>
            <span>Instagram</span>
          </a>
          <a 
            href="https://twitter.com/muqawamah" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="social-link-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fab fa-twitter" style={{ fontSize: '24px' }}></i>
            <span>Twitter</span>
          </a>
          <a 
            href="mailto:info@muqawamah.com" 
            className="social-link-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-envelope" style={{ fontSize: '24px' }}></i>
            <span>Email</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default Social2026;

