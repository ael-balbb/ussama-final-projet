import { Banknote, Facebook, Instagram, MessageCircle, Phone, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const VALUE_PROPS = [
  { icon: Truck, title: 'Livraison partout au Maroc', detail: 'Service national' },
  { icon: ShieldCheck, title: 'Catalogue actualisé', detail: 'Prix et stock synchronisés' },
  { icon: Banknote, title: 'Paiement à la livraison', detail: 'Réglez à la réception' },
  { icon: RefreshCw, title: 'Assistance directe', detail: 'Conseil sur WhatsApp' },
];

export default function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {!compact && (
        <section className="value-props" aria-label="Services NasriPhone">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="value-prop">
              <item.icon size={24} strokeWidth={1.6} />
              <span><strong>{item.title}</strong><small>{item.detail}</small></span>
            </div>
          ))}
        </section>
      )}

      <footer className={`footer ${compact ? 'footer-compact' : ''}`}>
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="footer-logo"><strong>Nasri</strong><span>Phone</span></Link>
            <p>Votre boutique de smartphones, accessoires et objets connectés à Ben Guerir.</p>
          </div>

          <nav className="footer-column" aria-label="Navigation secondaire">
            <h2>Navigation</h2>
            <Link to="/">Accueil</Link>
            <Link to="/catalog?category=phone">Téléphones</Link>
            <Link to="/catalog?category=accessory">Accessoires</Link>
            <Link to="/catalog">Nouveautés</Link>
          </nav>

          <div className="footer-column">
            <h2>Aide &amp; Support</h2>
            <a href="tel:0524222744">Appeler la boutique</a>
            <a href="https://wa.me/212660891219" target="_blank" rel="noopener noreferrer">Conseil produit</a>
            <span>Paiement à la livraison</span>
            <span>Ben Guerir, Maroc</span>
          </div>

          <div className="footer-column footer-contact-column">
            <h2>Contactez-nous</h2>
            <a href="tel:0524222744"><Phone size={14} />05 24 22 27 44</a>
            <a href="https://wa.me/212660891219" target="_blank" rel="noopener noreferrer"><MessageCircle size={14} />06 60 89 12 19</a>
            <span>المركب التجاري قرب الملعب البلدي ابن جرير</span>
          </div>

          <div className="footer-column footer-follow">
            <h2>Suivez-nous</h2>
            <div>
              <a href="https://www.facebook.com/nasriphone" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://www.instagram.com/nasri_phone83" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://wa.me/212660891219" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} NasriPhone. Tous droits réservés.</p>
            <span>Paiement à la livraison</span>
          </div>
        </div>

        <a
          className="footer-whatsapp"
          href="https://wa.me/212660891219"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter NasriPhone sur WhatsApp"
        >
          <MessageCircle size={28} />
        </a>
      </footer>
    </>
  );
}
