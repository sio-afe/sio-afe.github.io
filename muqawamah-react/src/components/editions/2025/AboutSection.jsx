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
    description: "Rooted in values & principles"
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
          <h2 className="section-title-modern">MUQAWAMA {edition}</h2>
          <div className="section-brief">
          
            <p className="section-description-modern">
              {is2026
                ? "Join us for an exciting tournament that brings together teams from across the region. Registration is now open for both Open Age and U17 categories."
                : "More than just a competition, Muqawama is a platform for unity, growth, and excellence. We bring together passionate players who share our values and vision for community building through football."
              }
            </p>
            <motion.a
              href="/muqawamah/about/"
              className="read-more-link"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              Read more about the tournament
            </motion.a>
          </div>
        </motion.div>

        {is2026 ? (
          <>
            <motion.div
              className="registration-section-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="registration-title">Muqawama 2026 Registration</h3>
              <p className="registration-description">
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
                  className="tournament-btn disabled"
                  type="button"
                  disabled
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

