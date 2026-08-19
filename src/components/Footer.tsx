import { Banknote, Mail, MapPin, MessageCircle, Phone, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import './Footer.css';

const VALUE_PROPS = [
  { icon: Truck, title: 'Livraison partout au Maroc', detail: 'Rapide et sécurisée' },
  { icon: ShieldCheck, title: 'Produits 100% originaux', detail: 'Garantie constructeur' },
  { icon: Banknote, title: 'Paiement à la livraison', detail: 'Payez en toute confiance' },
  { icon: RefreshCw, title: 'Retour facile 7 jours', detail: 'Satisfait ou remboursé' },
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
            <p>Votre boutique spécialisée en smartphones, accessoires et objets connectés au Maroc.</p>
          </div>

          <nav className="footer-column footer-nav-column" aria-label="Navigation secondaire">
            <h2>Navigation</h2>
            <Link to="/">Accueil</Link>
            <Link to="/catalog?category=phone">Téléphones</Link>
            <Link to="/catalog?category=accessory">Accessoires</Link>
            <Link to="/catalog">Nouveautés</Link>
          </nav>

          <div className="footer-column footer-help-column">
            <h2>Aide &amp; Support</h2>
            <span>Livraison &amp; paiements</span>
            <span>Retours &amp; remboursements</span>
            <span>Questions fréquentes</span>
            <a href="https://wa.me/212660891219" target="_blank" rel="noopener noreferrer">Nous contacter</a>
          </div>

          <div className="footer-column footer-contact-column">
            <h2>Contactez-nous</h2>
            <a href="tel:0524222744"><Phone size={14} />05 24 22 27 44</a>
            <a href="mailto:contact@nasriphone.ma"><Mail size={14} />contact@nasriphone.ma</a>
            <span><MapPin size={14} />Ben Guerir, Maroc</span>
          </div>

          <div className="footer-column footer-follow">
            <h2>Suivez-nous</h2>
            <div>
              <a href="https://www.facebook.com/profile.php?id=100067470919533" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://www.instagram.com/nasri_phone83" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://www.tiktok.com/@nasriphone1" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} NasriPhone. Tous droits réservés.</p>
            <span className="footer-legal-links"><span>Mentions légales</span><i /> <span>Conditions générales</span><i /> <span>Politique de confidentialité</span></span>
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
