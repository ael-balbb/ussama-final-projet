import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';
import './HeroMobileAlignment.css';

const MotionLink = motion.create(Link);

const HERO_TITLE_LINES = [
  '𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒖𝒆 𝒄𝒉𝒆𝒛',
  '𝑵𝒂𝒔𝒓𝒊 𝑷𝒉𝒐𝒏𝒆 𝑺𝒕𝒐𝒓𝒆',
];

const titleLetterVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: ((index % 3) - 1) * 9,
    y: index % 2 === 0 ? 16 : -12,
    rotate: index % 2 === 0 ? -8 : 8,
    scale: 0.68,
    filter: 'blur(7px)',
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 230,
      damping: 20,
    },
  },
};

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
          <motion.h1
            className="hero-title hero-title-animated"
            aria-label="Bienvenue chez Nasri Phone Store"
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            transition={reduceMotion ? { duration: 0 } : { staggerChildren: 0.035, delayChildren: 0.14 }}
          >
            {HERO_TITLE_LINES.map((line, lineIndex) => (
              <span className="hero-title-line" key={line} aria-hidden="true">
                {Array.from(line).map((character, characterIndex) => {
                  const animationIndex = lineIndex * 18 + characterIndex;
                  return (
                    <motion.span
                      className={`hero-title-char ${character === ' ' ? 'hero-title-space' : ''}`}
                      custom={animationIndex}
                      variants={titleLetterVariants}
                      style={{ '--char-index': animationIndex } as React.CSSProperties}
                      key={`${character}-${characterIndex}`}
                    >
                      {character === ' ' ? '\u00a0' : character}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.h1>

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
