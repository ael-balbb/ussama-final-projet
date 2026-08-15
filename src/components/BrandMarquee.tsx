import React, { useState } from 'react';
import './BrandMarquee.css';

interface BrandMarqueeProps {
  brands: string[];
}

const BRANDFETCH_CLIENT_ID =
  'iYroDsu5311fdBbgI99d90Sib0oRTiNYAkdrLPNNGQQmJ8ntTOasI8bwHnl8DuhV62J23Xt2ny-kfHaXXCPYFw';

/** Known brand → official domain mapping for the Brandfetch Logo API. */
const BRAND_DOMAINS: Record<string, string> = {
  apple: 'apple.com',
  samsung: 'samsung.com',
  xiaomi: 'mi.com',
  redmi: 'mi.com',
  huawei: 'huawei.com',
  oppo: 'oppo.com',
  vivo: 'vivo.com',
  infinix: 'infinixmobility.com',
  tecno: 'tecno-mobile.com',
  realme: 'realme.com',
  honor: 'hihonor.com',
  oneplus: 'oneplus.com',
  google: 'google.com',
  pixel: 'google.com',
  nokia: 'nokia.com',
  sony: 'sony.com',
  jbl: 'jbl.com',
  anker: 'anker.com',
  baseus: 'baseus.com',
  belkin: 'belkin.com',
  logitech: 'logitech.com',
  lg: 'lg.com',
};

const FALLBACK_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Infinix', 'JBL', 'Anker'];

const brandDomain = (brand: string): string => {
  const key = brand.toLowerCase().trim();
  return BRAND_DOMAINS[key] || `${key.replace(/\s+/g, '')}.com`;
};

const logoUrl = (brand: string): string =>
  `https://cdn.brandfetch.io/${brandDomain(brand)}?c=${BRANDFETCH_CLIENT_ID}`;

/** Logo image with graceful fallback to a text wordmark. */
const BrandLogo: React.FC<{ brand: string }> = ({ brand }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="brand-marquee-wordmark">{brand}</span>;
  }

  return (
    <img
      className="brand-marquee-logo"
      src={logoUrl(brand)}
      alt={brand}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const BrandMarquee: React.FC<BrandMarqueeProps> = ({ brands }) => {
  const list = brands.length >= 3 ? brands : FALLBACK_BRANDS;
  // Duplicate the sequence so the -50% translate loops seamlessly.
  const track = [...list, ...list];

  return (
    <section className="brand-marquee" aria-label="Nos marques partenaires">
      <div className="brand-marquee-bg" aria-hidden="true">
        <span className="brand-marquee-orb orb-gold" />
        <span className="brand-marquee-orb orb-blue" />
        <span className="brand-marquee-orb orb-soft" />
        <span className="brand-marquee-sheen" />
      </div>
      <div className="brand-marquee-fade left" aria-hidden="true" />
      <div className="brand-marquee-fade right" aria-hidden="true" />
      <div className="brand-marquee-track" style={{ animationDuration: `${list.length * 5}s` }}>
        {track.map((brand, index) => (
          <span key={`${brand}-${index}`} className="brand-marquee-item">
            <BrandLogo brand={brand} />
          </span>
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
