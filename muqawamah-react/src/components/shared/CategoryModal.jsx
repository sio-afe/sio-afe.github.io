import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CategoryModal.css';

function CategoryModal({ isOpen, onClose }) {
  const categories = [
    {
      title: 'Open Age',
      description: 'For players aged 18 and above',
      icon: 'fas fa-users',
      link: '/muqawamah/2026/open-age/fixtures/',
      color: '#4f8cff'
    },
    {
      title: 'Under 17',
      description: 'For players under 17 years',
      icon: 'fas fa-child',
      link: '/muqawamah/2026/u17/fixtures/',
      color: '#6ecdee'
    }
  ];

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { 
      opacity: 1, 
      backdropFilter: "blur(8px)",
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      backdropFilter: "blur(0px)",
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      rotateX: 10
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 30,
      transition: { duration: 0.2 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.2, duration: 0.4 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: 0.3
      }
    }
  };

  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="category-modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="category-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button 
              className="modal-close-btn" 
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <i className="fas fa-times"></i>
            </motion.button>

            <motion.div 
              className="modal-header"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.i 
                className="fas fa-trophy modal-icon"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              />
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                Select Tournament Category
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Choose which category you want to view
              </motion.p>
            </motion.div>

            <motion.div 
              className="category-cards"
              variants={cardsContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {categories.map((category, index) => (
                <motion.a
                  key={index}
                  href={category.link}
                  className="category-card"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    boxShadow: `0 20px 40px ${category.color}30`,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div 
                    className="category-icon" 
                    style={{ background: `${category.color}20`, color: category.color }}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <i className={category.icon}></i>
                  </motion.div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <motion.div 
                    className="category-arrow" 
                    style={{ color: category.color }}
                    initial={{ x: -5, opacity: 0 }}
                    whileHover={{ x: 5, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className="fas fa-arrow-right"></i>
                  </motion.div>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CategoryModal;

