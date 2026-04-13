import React from 'react';
import { MapPin, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>NASRI PHONE</h3>
            <p>Votre boutique de confiance pour téléphones et accessoires au Maroc</p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <div className="footer-links">
              <a href="tel:0524222744" className="footer-link">
                <Phone size={18} />
                <span>05 24 22 27 44</span>
              </a>
              <a href="https://wa.me/212660891219" className="footer-link" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} />
                <span>06 60 89 12 19</span>
              </a>
              <div className="footer-link">
                <MapPin size={18} />
                <span>المركب التجاري قرب الملعب البلدي ابن جرير</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4>Suivez-nous</h4>
            <div className="social-links">
              <a 
                href="https://www.instagram.com/nasri_phone83?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://www.facebook.com/nasriphone" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nasri Phone. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
