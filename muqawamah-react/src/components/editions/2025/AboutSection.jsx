import React from 'react';
import { motion } from 'framer-motion';
import RegistrationSlots from '../../shared/RegistrationSlots';

const values = [
  {
    icon: "fas fa-users",
    title: "Unity",
    description: "Building bonds beyond the field"
  },
  {
    icon: "fas fa-heart",
    title: "Values",
    description: "Ethics & discipline in sport"
  },
  {
    icon: "fas fa-trophy",
    title: "Excellence",
    description: "Developing talent & character"
  },
  {
    icon: "fas fa-hands-praying",
    title: "Identity",
    description: "Rooted in Islamic principles"
  }
];

function AboutSection({ edition }) {
  const is2026 = edition === '2026';

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
          <h2 className="section-title-modern">About MUQAWAMA {edition}</h2>
          <p className="section-subtitle-modern">
            {is2026 
              ? "Coming Soon - The next chapter of our movement"
              : "A two-day football tournament building community through sport & values"
            }
          </p>
        </motion.div>

        {is2026 ? (
          <>
            <motion.div
              className="coming-soon-notice"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <i className="fas fa-calendar-alt"></i>
              <h3>Muqawama 2026 Registration</h3>
              <p>
                Captains can now reserve their slots for Open Age or U17. Submit your roster, logo and preferred formation.
              </p>
            <div className="action-buttons-2026">
              <button
                className="register-btn"
                type="button"
                onClick={() => (window.location.href = '/muqawamah/2026/register/')}
              >
                Register Your Team
              </button>
              <button
                className="tournament-btn"
                type="button"
                onClick={() => (window.location.href = '/muqawamah/2026/open-age/')}
              >
                View Tournament
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <RegistrationSlots />
          </motion.div>
        </>
        ) : (
          <>
            <div className="values-grid-modern">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="value-card-modern"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="value-icon-modern">
                    <i className={value.icon}></i>
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="vision-card-modern"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="vision-content">
                <i className="fas fa-quote-left quote-icon"></i>
                <p className="vision-text">
                  More than a tournament—a movement building a football club where players unite, 
                  grow, and embody excellence both on and off the field.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

export default AboutSection;

