import React from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import './ImmersiveBanner.css';

const ImmersiveBanner: React.FC = () => {
  return (
    <section className="immersive-banner" aria-label="Réservation en ligne">
      <div className="reservation-strip">
        <span className="reservation-icon" aria-hidden="true"><CalendarDays /></span>
        <div className="reservation-copy">
          <strong>Réservez avec 100 DH</strong>
          <span>Réservez en ligne, payez le reste à la livraison.</span>
        </div>
        <a
          className="reservation-action"
          href="https://wa.me/212660891219?text=Bonjour%20NasriPhone%2C%20je%20souhaite%20r%C3%A9server%20un%20produit."
          target="_blank"
          rel="noopener noreferrer"
        >
          Réserver maintenant
          <ArrowRight size={18} strokeWidth={1.7} />
        </a>
      </div>
    </section>
  );
};

export default ImmersiveBanner;
