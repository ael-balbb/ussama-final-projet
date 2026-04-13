# Nasri Phone Store 📱

Un site e-commerce moderne pour la vente de téléphones et accessoires au Maroc, construit avec React, TypeScript, et des animations Framer Motion.

## 🎨 Caractéristiques

- **Design Moderne**: Interface utilisateur élégante avec thème clair/sombre
- **Mode Sombre/Clair**: Basculez entre les thèmes avec transition fluide
- **Recherche et Filtres**: Trouvez facilement des produits par nom et catégorie
- **Panier d'Achat**: Gestion complète du panier avec quantités modifiables
- **Formulaire de Commande**: Validation pour les utilisateurs marocains (villes et numéros de téléphone)
- **Intégration Google Sheets**: Sauvegarde automatique des commandes sans backend
- **Responsive**: Optimisé pour mobile, tablette et desktop

## 🚀 Installation et Lancement


```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## 📊 Configuration Google Sheets

Pour recevoir les commandes dans Google Sheets, suivez ces étapes:

### Étape 1: Créer une Google Sheet

1. Créez une nouvelle Google Sheet
2. Ajoutez les en-têtes suivants dans la première ligne:
   - Date
   - Prénom
   - Nom
   - Ville
   - Téléphone
   - Produits
   - Total (DH)

### Étape 2: Créer un Google Apps Script

1. Dans votre Google Sheet, allez à **Extensions** → **Apps Script**
2. Supprimez le code existant et collez le suivant:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.orderDate,
      data.firstName,
      data.lastName,
      data.city,
      data.phoneNumber,
      data.orderDetails,
      data.totalAmount
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Cliquez sur **Déployer** → **Nouveau déploiement**
4. Sélectionnez **Application Web**
5. Configuration:
   - Description: "Nasri Phone Orders"
   - Exécuter en tant que: **Moi**
   - Qui a accès: **Tout le monde**
6. Cliquez sur **Déployer** et copiez l'URL web

### Étape 3: Configurer l'Application

1. Ouvrez le fichier `src/utils/googleSheets.ts`
2. Remplacez `YOUR_GOOGLE_SCRIPT_URL_HERE` par l'URL que vous avez copiée
3. Sauvegardez le fichier et redémarrez le serveur de développement

## 📁 Structure du Projet

```
nasri-phone-store/
├── src/
│   ├── components/          # Composants React
│   │   ├── Header.tsx
│   │   ├── SearchFilter.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartModal.tsx
│   │   └── CheckoutModal.tsx
│   ├── data/
│   │   └── products.ts      # Catalogue de produits
│   ├── types/
│   │   └── index.ts         # Types TypeScript
│   ├── utils/
│   │   └── googleSheets.ts  # Intégration Google Sheets
│   ├── App.tsx              # Composant principal
│   └── index.css            # Styles globaux
├── public/
│   └── logo.png             # Logo de l'entreprise
└── README.md
```

## 🛠️ Technologies Utilisées

- **React 18**: Framework UI
- **TypeScript**: Typage statique
- **Vite**: Build tool rapide
- **Framer Motion**: Animations fluides
- **Lucide React**: Icônes modernes
- **Google Sheets API**: Stockage des commandes

## 📝 Personnalisation

### Ajouter des Produits

Modifiez le fichier `src/data/products.ts` pour ajouter vos propres produits:

```typescript
{
  id: 'unique-id',
  name: 'Nom du produit',
  category: 'phone' ou 'accessory',
  brand: 'Marque',
  price: 9999, // Prix en DH
  image: 'URL de l\'image',
  description: 'Description',
  stock: 50,
}
```

### Modifier les Villes

Ajoutez ou supprimez des villes dans `src/components/CheckoutModal.tsx`.

## 🎨 Couleurs du Thème

- Jaune: `#FFD700`
- Noir: `#000000`
- Blanc: `#FFFFFF`

Modifiez ces valeurs dans `src/index.css` pour changer le thème.

## 📱 Validation des Numéros

Les numéros de téléphone doivent:
- Commencer par 06 ou 07
- Contenir exactement 10 chiffres
- Exemple: `0612345678`

## 🚀 Déploiement

Pour déployer votre site:

1. **Vercel** (Recommandé):
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**:
   ```bash
   npm run build
   # Glissez-déposez le dossier 'dist' sur Netlify
   ```

## 📞 Support

Pour toute question ou assistance:
- Email: nasriphone83@gmail.com
- Téléphone: 06XXXXXXXX

## 📄 Licence

© 2026 Nasri Phone - Tous droits réservés

---

**Développé avec ❤️ pour le marché marocain**
