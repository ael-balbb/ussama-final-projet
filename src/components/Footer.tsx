import React from 'react';
import {
  Truck,
  ShieldCheck,
  Instagram,
  Facebook,
  MessageCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import './Footer.css';

const VALUE_PROPS = [
  { icon: Truck, label: 'Livraison partout au Maroc' },
  { icon: ShieldCheck, label: 'Catalogue et stock actualisés' },
  { icon: MessageCircle, label: 'Assistance directe sur WhatsApp' },
];

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Catégories',
    links: [
      { label: 'Nouveautés', href: '#nouveautes' },
      { label: 'Grandes marques', href: '#marques' },
      { label: 'Offres & promos', href: '#offres' },
    ],
  },
  {
    title: 'Boutique',
    links: [
      { label: 'Téléphones', href: '#telephones' },
      { label: 'Accessoires', href: '#accessoires' },
      { label: 'Packs promo', href: '#offres' },
      { label: 'Tous les produits', href: '#nouveautes' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Appeler la boutique', href: 'tel:0524222744' },
      { label: "Centre d'aide", href: 'https://wa.me/212660891219' },
      { label: 'Instagram', href: 'https://www.instagram.com/nasri_phone83' },
    ],
  },
];

const PAYMENT_METHODS = ['Paiement à la livraison'];

const Footer: React.FC = () => {
  return (
    <>
      <section className="value-props" aria-label="Avantages">
        {VALUE_PROPS.map((item) => (
          <div key={item.label} className="value-prop">
            <item.icon size={20} strokeWidth={1.5} />
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-logo">
                Nasri<span className="footer-logo-accent">Phone</span>
              </span>
              <p className="footer-tagline">
                Électronique premium pour votre quotidien, partout au Maroc.
              </p>
              <div className="footer-contact">
                <a href="tel:0524222744">
                  <Phone size={15} strokeWidth={1.5} />
                  05 24 22 27 44
                </a>
                <a href="https://wa.me/212660891219" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={15} strokeWidth={1.5} />
                  06 60 89 12 19
                </a>
                <span>
                  <MapPin size={15} strokeWidth={1.5} />
                  المركب التجاري قرب الملعب البلدي ابن جرير
                </span>
              </div>
              <div className="footer-socials">
                <a
                  href="https://www.instagram.com/nasri_phone83?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/nasriphone"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
                <a
                  href="https://wa.me/212660891219"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            <div className="footer-columns">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="footer-column">
                  <h4>{column.title}</h4>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...(link.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-watermark" aria-hidden="true">
            NasriPhone
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Nasri Phone. Tous droits réservés.</p>
            <div className="footer-payments" aria-label="Mode de paiement">
              {PAYMENT_METHODS.map((method) => (
                <span key={method} className="footer-payment-chip">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
