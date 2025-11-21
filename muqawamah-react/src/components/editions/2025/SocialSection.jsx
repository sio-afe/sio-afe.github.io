import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { number: "22", label: "Teams", icon: "fas fa-shield-alt" },
  { number: "200+", label: "Players", icon: "fas fa-users" },
  { number: "1000+", label: "Photos", icon: "fas fa-camera" }
];

function SocialSection({ edition }) {
  return (
    <section id="contact" className="social-section-modern">
      <div className="container-modern">
        <motion.div
          className="social-content-modern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="social-title-modern">Join the Community</h2>
          <p className="social-subtitle-modern">
            Follow us for updates, highlights, and exclusive content
          </p>

          <motion.a 
            href="https://instagram.com/muqawama2025" 
            target="_blank" 
            rel="noopener" 
            className="instagram-button-modern"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fab fa-instagram"></i>
            <span>@muqawama2025</span>
          </motion.a>

          <div className="stats-grid-modern">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card-modern"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <i className={stat.icon}></i>
                <span className="stat-number-modern">{stat.number}</span>
                <span className="stat-label-modern">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SocialSection;

