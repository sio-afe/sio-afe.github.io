import React from 'react';
import { motion } from 'framer-motion';

const tournaments = [
  {
    category: "Open Age",
    icon: "fas fa-users",
    status: "Completed",
    teams: 12
  },
  {
    category: "Under 17",
    icon: "fas fa-user-graduate",
    status: "Completed",
    teams: 10
  }
];

function CTASection({ edition }) {
  const is2026 = edition === '2026';

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
          
          {is2026 ? (
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
          ) : (
            <div className="tournament-cards-grid">
              {tournaments.map((tournament, index) => (
                <motion.div
                  key={index}
                  className="tournament-card-modern"
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="tournament-icon-wrapper">
                    <i className={tournament.icon}></i>
                  </div>
                  <h3>{tournament.category}</h3>
                  <div className="tournament-meta">
                    <span className="meta-item">
                      <i className="fas fa-trophy"></i> {tournament.teams} Teams
                    </span>
                    <span className="status-badge">{tournament.status}</span>
                  </div>
                  <button className="view-details-btn">View Results</button>
                </motion.div>
              ))}
            </div>
          )}

          <motion.p
            className="cta-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {is2026 ? 'More information coming soon' : 'Stay tuned for next tournament announcements'}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;

