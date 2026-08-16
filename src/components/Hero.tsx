import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';
import './HeroMobileAlignment.css';

const MotionLink = motion.create(Link);

const Hero: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero" id="accueil">
      <img
        className="hero-bg is-ready"
        src="/hero-shop-owner.jpg"
        alt=""
        fetchPriority="high"
        decoding="async"
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content-wrap">
        <motion.div
          className="hero-content"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 }}
        >
          <h1 className="hero-title">
            Boostez votre
            <br />
            vie numérique
          </h1>

          <p className="hero-subtitle">
            Découvrez les derniers smartphones, accessoires et objets connectés
            aux meilleurs prix.
          </p>

          <div className="hero-actions">
            <MotionLink
              to="/catalog"
              className="hero-cta"
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              Explorer les produits
              <ArrowRight size={18} strokeWidth={1.5} />
            </MotionLink>
            <MotionLink
              to="/catalog"
              className="hero-cta-ghost"
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              Voir les nouveautés
            </MotionLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
