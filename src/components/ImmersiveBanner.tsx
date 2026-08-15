import React from 'react';
import './ImmersiveBanner.css';

const ImmersiveBanner: React.FC = () => {
  return (
    <section className="immersive-banner" aria-label="Offre de réservation">
      <div className="immersive-banner-frame">
        <img
          className="immersive-banner-image"
          src="/promo-payment-banner.jpg?v=4"
          alt="Pour les produits de plus de 1000 DH, réservez avec 100 DH seulement et payez le reste à la livraison"
          width={1024}
          height={354}
          decoding="async"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default ImmersiveBanner;
