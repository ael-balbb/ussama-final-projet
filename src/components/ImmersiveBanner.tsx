import './ImmersiveBanner.css';

const reservationUrl = 'https://wa.me/212660891219?text=Bonjour%20NasriPhone%2C%20je%20souhaite%20r%C3%A9server%20un%20produit.';

const ImmersiveBanner = () => {
  return (
    <section className="immersive-banner" aria-label="Réservation en ligne">
      <a
        className="reservation-visual"
        href={reservationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Réserver un produit de plus de 1 000 DH avec un acompte de 100 DH"
      >
        <img
          src="/promo-payment-banner.png"
          alt="Pour les produits de plus de 1 000 DH, réservez avec 100 DH seulement et payez le reste à la livraison"
        />
      </a>
    </section>
  );
};

export default ImmersiveBanner;
