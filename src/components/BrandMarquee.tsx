import React from 'react';
import './BrandMarquee.css';

interface BrandMarqueeProps {
  brands: string[];
}

const BrandMarquee: React.FC<BrandMarqueeProps> = ({ brands }) => {
  if (brands.length === 0) return null;

  // Repeat only catalog-backed names when a small catalog would leave visual gaps.
  const list = Array.from(
    { length: Math.max(1, Math.ceil(8 / brands.length)) },
    () => brands
  ).flat();
  // Duplicate the sequence so the -50% translate loops seamlessly.
  const track = [...list, ...list];

  return (
    <section
      className="brand-marquee"
      id="marques"
      aria-label={`Marques disponibles : ${brands.join(', ')}`}
    >
      <div className="brand-marquee-bg" aria-hidden="true">
        <span className="brand-marquee-orb orb-gold" />
        <span className="brand-marquee-orb orb-blue" />
        <span className="brand-marquee-orb orb-soft" />
        <span className="brand-marquee-sheen" />
      </div>
      <div className="brand-marquee-fade left" aria-hidden="true" />
      <div className="brand-marquee-fade right" aria-hidden="true" />
      <div
        className="brand-marquee-track"
        style={{ animationDuration: `${list.length * 3}s` }}
        aria-hidden="true"
      >
        {track.map((brand, index) => (
          <span key={`${brand}-${index}`} className="brand-marquee-item">
            <span className="brand-marquee-wordmark">{brand}</span>
          </span>
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
