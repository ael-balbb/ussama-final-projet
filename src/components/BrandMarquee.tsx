import {
  SiApple,
  SiHuawei,
  SiXiaomi,
} from 'react-icons/si';
import './BrandMarquee.css';

const BRANDS = [
  { label: 'Apple', Icon: SiApple, logo: null },
  { label: 'Samsung', Icon: null, logo: '/brands/samsung.webp' },
  { label: 'Xiaomi', Icon: SiXiaomi, logo: null },
  { label: 'Huawei', Icon: SiHuawei, logo: null },
  { label: 'OPPO', Icon: null, logo: '/brands/oppo.svg' },
  { label: 'Infinix', Icon: null, logo: '/brands/infinix.svg' },
  { label: 'JBL', Icon: null, logo: '/brands/jbl.png' },
  { label: 'ANKER', Icon: null, logo: '/brands/anker.svg' },
];

export default function BrandMarquee() {
  return (
    <section className="brand-marquee" id="marques" aria-label="Marques disponibles">
      <div className="brand-marquee-track">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="brand-marquee-set" aria-hidden={setIndex === 1}>
            {BRANDS.map(({ label, Icon, logo }) => (
              <span key={`${setIndex}-${label}`} className={`brand-marquee-item brand-${label.toLowerCase()}`}>
                {logo ? (
                  <img
                    className="brand-marquee-logo"
                    src={logo}
                    alt=""
                    loading="eager"
                    decoding="async"
                    aria-hidden="true"
                  />
                ) : (
                  Icon && <Icon className="brand-marquee-icon" aria-hidden="true" />
                )}
                <span className={`brand-marquee-wordmark${logo ? ' brand-marquee-wordmark--accessible' : ''}`}>
                  {label}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
