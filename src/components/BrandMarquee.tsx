import {
  SiApple,
  SiHuawei,
  SiJbl,
  SiOppo,
  SiSamsung,
  SiXiaomi,
} from 'react-icons/si';
import './BrandMarquee.css';

const BRANDS = [
  { label: 'Apple', Icon: SiApple },
  { label: 'Samsung', Icon: SiSamsung },
  { label: 'Xiaomi', Icon: SiXiaomi },
  { label: 'Huawei', Icon: SiHuawei },
  { label: 'OPPO', Icon: SiOppo },
  { label: 'Infinix', Icon: null },
  { label: 'JBL', Icon: SiJbl },
  { label: 'ANKER', Icon: null },
];

export default function BrandMarquee() {
  return (
    <section className="brand-marquee" id="marques" aria-label="Marques disponibles">
      <div className="brand-marquee-track">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="brand-marquee-set" aria-hidden={setIndex === 1}>
            {BRANDS.map(({ label, Icon }) => (
              <span key={`${setIndex}-${label}`} className={`brand-marquee-item brand-${label.toLowerCase()}`}>
                {Icon && <Icon className="brand-marquee-icon" aria-hidden="true" />}
                <span className="brand-marquee-wordmark">{label}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
