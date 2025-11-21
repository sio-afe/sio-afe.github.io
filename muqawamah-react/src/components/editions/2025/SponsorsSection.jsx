import React from 'react';
import { motion } from 'framer-motion';

const sponsors = [
  { name: "Shaheen Academy", image: "/assets/data/sponsors/shaheen-academy.png" },
  { name: "Hidayat Publishers", image: "/assets/data/sponsors/hidayat.png" },
  { name: "Oceans Secret", image: "/assets/data/sponsors/ocean.png" },
  { name: "White Dot Publishers", image: "/assets/data/sponsors/whitedot.jpeg" },
  { name: "Bazmi PG", image: "/assets/data/sponsors/bazmi.jpeg" },
  { name: "Dr Lal Hospital", image: "/assets/data/sponsors/motilal.png" },
  { name: "Shaheen Public School", image: "/assets/data/sponsors/sps.jpeg" },
  { name: "Nadeem Contactor", image: "/assets/data/sponsors/nadeem.jpeg" },
  { name: "Jabbar Contactor", image: "/assets/data/sponsors/jabbar.png" },
  { name: "Zavia Prints", image: "/assets/data/sponsors/zavia.png" }
];

function SponsorsSection({ edition }) {
  const is2026 = edition === '2026';

  if (is2026) return null; // Don't show sponsors for 2026 yet

  return (
    <section id="sponsors" className="sponsors-section-modern">
      <div className="container-modern">
        <motion.div
          className="section-header-modern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-modern">Our Sponsors</h2>
          <p className="section-subtitle-modern">Proud partners making MUQAWAMA possible</p>
        </motion.div>

        <div className="sponsors-grid-modern">
          {sponsors.map((sponsor, index) => (
            <motion.div 
              key={index} 
              className="sponsor-card-modern"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.05 }}
            >
              <img src={sponsor.image} alt={sponsor.name} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SponsorsSection;

