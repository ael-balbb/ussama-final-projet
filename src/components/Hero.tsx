import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Truck } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

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
        aria-hidden="true"
      >
        <source src="/hero-background.mp4?v=okkey1" type="video/mp4" />
      </video>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content-wrap">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <Truck size={14} strokeWidth={1.5} />
            Livraison express partout au Maroc
          </span>

          <h1 className="hero-title">
            Boostez votre
            <br />
            vie numérique
          </h1>

          <p className="hero-subtitle">
            Découvrez les derniers smartphones, accessoires et objets connectés
            aux meilleurs prix. Les plus grandes marques, avec livraison rapide
            et paiement à la livraison.
          </p>

          <div className="hero-actions">
            <a href="#nouveautes" className="hero-cta">
              Explorer les produits
              <ArrowRight size={18} strokeWidth={1.5} />
            </a>
            <a href="#nouveautes" className="hero-cta-ghost">
              Voir les nouveautés
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
