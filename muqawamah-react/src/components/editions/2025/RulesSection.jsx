import React from 'react';
import { motion } from 'framer-motion';

const keyRules = [
  {
    icon: "fas fa-calendar-check",
    title: "Register Early",
    description: "Complete player registration before tournament day"
  },
  {
    icon: "fas fa-clock",
    title: "Arrive on Time",
    description: "Teams must arrive 15 minutes before match time"
  },
  {
    icon: "fas fa-handshake",
    title: "Respect & Fair Play",
    description: "Honor referees, opponents, and tournament rules"
  },
  {
    icon: "fas fa-shield-alt",
    title: "Zero Tolerance",
    description: "No misconduct, smoking, or prohibited items"
  }
];

function RulesSection({ edition }) {
  const is2026 = edition === '2026';

  if (is2026) return null; // Don't show rules for 2026 yet

  return (
    <section id="rules" className="rules-section-modern">
      <div className="container-modern">
        <motion.div
          className="section-header-modern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-modern">Tournament Guidelines</h2>
          <p className="section-subtitle-modern">Fair play, respect, and excellence</p>
        </motion.div>

        <div className="key-rules-grid">
          {keyRules.map((rule, index) => (
            <motion.div
              key={index}
              className="key-rule-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="rule-icon-wrapper">
                <i className={rule.icon}></i>
              </div>
              <h3>{rule.title}</h3>
              <p>{rule.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default RulesSection;

