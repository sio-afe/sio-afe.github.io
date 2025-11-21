import React from 'react';
import { motion } from 'framer-motion';

function FindImagesSection({ edition }) {
  const is2026 = edition === '2026';

  if (is2026) return null; // Don't show gallery for 2026 yet

  return (
    <section id="gallery" className="gallery-section-modern">
      <div className="container-modern">
        <div className="gallery-split">
          <motion.div
            className="gallery-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <i className="fas fa-images gallery-icon"></i>
            <h2>Tournament Gallery</h2>
            <p>Scan the QR code to access all photos and relive the best moments from MUQAWAMA 2025</p>
            <div className="gallery-features">
              <span><i className="fas fa-check-circle"></i> 1000+ Photos</span>
              <span><i className="fas fa-check-circle"></i> HD Quality</span>
              <span><i className="fas fa-check-circle"></i> Free Download</span>
            </div>
          </motion.div>

          <motion.div
            className="gallery-qr"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/assets/img/find_images_qr.png" 
              alt="QR Code for Tournament Images"
            />
            <p className="qr-label">Scan with your camera</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FindImagesSection;

