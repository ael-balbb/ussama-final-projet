import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import type { OrderForm, CartItem } from '../types';
import { submitOrder } from '../utils/api';
import './CheckoutModal.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

const moroccoCities = [
  "Afourar", "Agadir", "Agdz", "Aghbala", "Agouim", "Ahfir", "Aïn Bni Mathar", "Aïn Cheggag", "Aïn Defali", "Aïn El Aouda",
  "Aïn Erreggada", "Aïn Harrouda", "Aïn Jemaa", "Aïn Karma", "Aïn Leuh", "Aïn Taoujdate", "Aït Baha", "Aït Boubidmane",
  "Aït Daoud", "Aït Iaâza", "Aït Melloul", "Aït Ourir", "Aït Youssef Ou Ali", "Akka", "Al Aaroui", "Al Hoceïma", "Alnif", 
  "Amizmiz", "Aoufous", "Aourir", "Arbaoua", "Arfoud", "Assahrij", "Assilah", "Awsard", "Azemmour", "Azilal", "Azrou", 
  "Aïn Dorij", "Béni Mellal", "Benslimane", "Berkane", "Berrechid", "Bhalil", "Bin elouidane", "Biougra", "Bir Jdid", 
  "Bni Bouayach", "Bni Drar", "Bni Hadifa", "Bni Tadjite", "Bouanane", "Bouarfa", "Boudnib", "Boufakrane", "Bouguedra", 
  "Bouhdila", "Bouizakarne", "Boulanouare", "Boulemane", "Boumalne-Dadès", "Boumia", "Bouskoura", "Bouznika", "Bradia", 
  "Benguerir", "Brikcha", "Béni Ansar", "Casablanca", "Chefchaouen", "Chichaoua", "Dar Bni Karrich", "Dar Chaoui", "Dar El Kebdani", 
  "Dar Gueddari", "Dar Ould Zidouh", "Dcheira El Jihadia", "Debdou", "Demnate", "Driouch", "El Aioun Sidi Mellouk", 
  "El Borouj", "El Gara", "El Guerdane", "El Hajeb", "El Hanchane", "El Jadida", "El Kelaâ des Sraghna", "El Ksiba", 
  "El Marsa", "El Menzel", "El Ouatia", "Erfoud", "Errachidia", "Essaouira", "Es-Semara", "Fès", "Figuig", "Fnideq", 
  "Fquih Ben Salah", "Guelmim", "Goulmima", "Guercif", "Gueznaia", "Guigou", "Guisser", "Had Kourt", "Haj Kaddour", 
  "Harhoura", "Hattane", "Ifrane", "Imintanoute", "Imouzzer Kandar", "Imouzzer Marmoucha", "Inezgane", "Jerada", 
  "Jorf", "Jorf El Melha", "Kalaat M'Gouna", "Kénitra", "Kébzat", "Kelaat-M-Gouna", "Kerrouchen", "Khemis Sahel", 
  "Khémisset", "Khenichet", "Khénifra", "Khouribga", "Ksar El Kébir", "Laaounate", "Laayoune", "Lakhsas", "Lalla Mimouna", 
  "Lalla Takerkoust", "Larache", "Lydec", "M'diq", "M'Rirt", "Mahja", "Marrakech", "Martil", "Massa", 
  "Mechra Bel Ksiri", "Mediek", "Médiouna", "Mehdia", "Meknès", "Midelt", "Missour", "Mohammedia", "Moqrisset", 
  "Moulay Ali Cherif", "Moulay Bousselham", "Moulay Idriss Zerhoun", "Nador", "N'Zalat Bni Amar", "Oualidia", "Ouaouizeght", 
  "Ouarzazate", "Ouazzane", "Oued Amlil", "Oued Heimer", "Oued Laou", "Oued Zem", "Oujda", "Oulad Abbou", "Oulad Amrane", 
  "Oulad Ayad", "Oulad Berhil", "Oulad Frej", "Oulad Ghadboune", "Oulad H'Riz Sahel", "Oulad M'Rah", "Oulad Mbarek", 
  "Oulad Teïma", "Oulad Zbair", "Ouled Tayeb", "Oulmès", "Ounagha", "Rabat", "Ras El Aïn", "Ribate El Kheir", 
  "Rissani", "Rommani", "Safi", "Salé", "Sebt El Maârif", "Sebt Gzoula", "Sefrou", "Settat", "Sidi Allal El Bahraoui", 
  "Sidi Allal Tazi", "Sidi Bennour", "Sidi Bou Othmane", "Sidi Boubker", "Sidi Jaber", "Sidi Kacem", "Sidi Lyamani", 
  "Sidi Rahhal", "Sidi Rahhal Chataï", "Sidi Slimane", "Sidi Smaïl", "Sidi Taibi", "Sidi Yahya El Gharb", "Skhirate", 
  "Smara", "Souk El Arbaa", "Souk Sebt Oulad Nemma", "Tahannaout", "Tafraout", "Tafrisset", "Taghjijt", "Tahla", 
  "Tala Tazegwaght", "Taliouine", "Talmest", "Taltjender", "Tanger", "Tan-Tan", "Taounate", "Taourirt", "Tarfaya", 
  "Taroudant", "Tata", "Taza", "Taznakht", "Témara", "Temsia", "Tétouan", "Thar Es-Souk", "Tichla", "Tidass", 
  "Tiflet", "Tigassaline", "Tighassaline", "Tignjdad", "Tiliouine", "Tinejdad", "Tiznit", "Tiztoutine", "Touissit", 
  "Toulal", "Tounfite", "Youssoufia", "Zag", "Zagora", "Zaïo", "Zaouia d'Ifrane", "Zaouïat Cheikh", "Zeghanghane", 
  "Zemamra", "Zirara", "Zoumi"
].sort();

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
}) => {
  const [formData, setFormData] = useState<OrderForm>({
    firstName: '',
    lastName: '',
    city: '',
    address: '',
    phoneNumber: '',
    quantity: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(06|07)[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderForm> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.city) {
      newErrors.city = 'La ville est requise';
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }
    if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Numéro invalide (format: 06XXXXXXXX ou 07XXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitOrder(formData, cartItems);
      setIsSuccess(true);
      
      setTimeout(() => {
        onOrderComplete();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      city: '',
      address: '',
      phoneNumber: '',
      quantity: 0,
    });
    setIsSuccess(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="checkout-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      <motion.div
        className="checkout-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {isSuccess ? (
          <motion.div
            className="success-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle size={80} color="var(--yellow)" />
            </motion.div>
            <h2>Commande Confirmée!</h2>
            <p>Merci pour votre commande. Nous vous contacterons bientôt!</p>
          </motion.div>
        ) : (
          <>
            <div className="checkout-header">
              <h2>Finaliser la Commande</h2>
              <motion.button
                className="close-btn"
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && (
                    <span className="error">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Votre nom"
                  />
                  {errors.lastName && (
                    <span className="error">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Ville *</label>
                <select
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                >
                  <option value="">Sélectionnez votre ville</option>
                  {moroccoCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <span className="error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>Adresse *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Votre adresse complète"
                />
                {errors.address && (
                  <span className="error">{errors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>Numéro de Téléphone *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="06XXXXXXXX ou 07XXXXXXXX"
                  maxLength={10}
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber}</span>
                )}
              </div>

              <div className="order-summary">
                <h3>Résumé de la Commande</h3>
                {cartItems.map((item) => (
                  <div key={item.product.id} className="summary-item">
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>
                      {(item.product.price * item.quantity).toLocaleString('fr-MA')} DH
                    </span>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Total:</span>
                  <span>{total.toLocaleString('fr-MA')} DH</span>
                </div>
              </div>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send size={20} />
                    </motion.div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Confirmer la Commande
                  </>
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </>
  );
};

export default CheckoutModal;
