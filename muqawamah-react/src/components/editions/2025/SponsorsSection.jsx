import React from 'react';
import { motion } from 'framer-motion';

const sponsors = [
  { name: 'Shaheen Academy', image: '/assets/data/sponsors/shaheen-academy.png' },
  { name: 'Hidayat Publishers', image: '/assets/data/sponsors/hidayat.png' },
  { name: 'Oceans Secret', image: '/assets/data/sponsors/ocean.png' },
  { name: 'White Dot Publishers', image: '/assets/data/sponsors/whitedot.jpeg' },
  { name: 'Bazmi PG', image: '/assets/data/sponsors/bazmi.jpeg' },
  { name: 'Dr Lal Hospital', image: '/assets/data/sponsors/motilal.png' },
  { name: 'Shaheen Public School', image: '/assets/data/sponsors/sps.jpeg' },
  { name: 'Nadeem Contractor', image: '/assets/data/sponsors/nadeem.jpeg' },
  { name: 'Jabbar Contractor', image: '/assets/data/sponsors/jabbar.png' },
  { name: 'Zavia Prints', image: '/assets/data/sponsors/zavia.png' }
];

function SponsorsSection({ edition }) {
  const showSponsors = edition === '2025';
  const rows = showSponsors
    ? [sponsors.slice(0, 5), sponsors.slice(5)]
    : [];

  if (!showSponsors) {
    return null;
  }

  return (
    <section id="sponsors" className="sponsors-section-modern">
      <p className="sponsors-eyebrow">Partners  •  Supporters  •  Community</p>
      {rows.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="sponsor-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: rowIndex * 0.1 }}
          viewport={{ once: true }}
        >
          {row.map((sponsor) => (
            <div key={sponsor.name} className="sponsor-logo">
              <img src={sponsor.image} alt={sponsor.name} />
            </div>
          ))}
        </motion.div>
      ))}
    </section>
  );
}

export default SponsorsSection;


