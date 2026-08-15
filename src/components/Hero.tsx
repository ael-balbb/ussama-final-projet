import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setReady(true);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          // Start loading only when hero is visible
          if (video.networkState === video.NETWORK_EMPTY) {
            video.load();
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '80px', threshold: 0.05 }
    );

    io.observe(video);

    return () => {
      io.disconnect();
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
    };
  }, []);

  return (
    <section className="hero" id="accueil">
      <video
        ref={videoRef}
        className={`hero-bg ${ready ? 'is-ready' : ''}`}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/store-background.jpg"
        aria-hidden="true"
      >
        <source src="/hero-background.mp4?v=okkey1" type="video/mp4" />
      </video>
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
            aux meilleurs prix. Les plus grandes marques, avec livraison partout
            au Maroc et paiement à la livraison.
          </p>

          <div className="hero-actions">
            <motion.a
              href="#nouveautes"
              className="hero-cta"
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              Explorer les produits
              <ArrowRight size={18} strokeWidth={1.5} />
            </motion.a>
            <motion.a
              href="#nouveautes"
              className="hero-cta-ghost"
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              Voir les nouveautés
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
