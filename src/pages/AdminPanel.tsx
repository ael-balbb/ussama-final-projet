import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, ClipboardList, LogOut, Plus, Edit3, Trash2,
  X, Upload, Search, Filter, ChevronDown,
  DollarSign, Box, AlertCircle, Check, Clock, Truck, XCircle, Image
} from 'lucide-react';
import {
  verifyToken, fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchPacks, createPack, updatePack, deletePack,
  fetchOrders, updateOrderStatus, deleteOrder, uploadImages
} from '../utils/api';
import type { Product, Pack, Order, ProductColor } from '../types';
import './AdminPanel.css';

type Tab = 'products' | 'packs' | 'orders';

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'Blanc', hex: '#f5f5f7' },
  { name: 'Noir', hex: '#1d1d1f' },
  { name: 'Gris sidéral', hex: '#7a7a7a' },
  { name: 'Bleu', hex: '#0066cc' },
  { name: 'Or', hex: '#d4af37' },
  { name: 'Rouge', hex: '#c41e3a' },
  { name: 'Vert', hex: '#3d6b4f' },
  { name: 'Violet', hex: '#5e4b8b' },
];

interface ProductForm {
  name: string;
  category: 'phone' | 'accessory';
  brand: string;
  price: string;
  compare_at_price: string;
  promo_label: string;
  stock: string;
  description: string;
  images: string[];
  colors: ProductColor[];
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: string;
}

interface PackForm {
  name: string;
  price: string;
  compare_at_price: string;
  promo_label: string;
  stock: string;
  description: string;
  image: string;
  color: 'dark' | 'yellow' | 'red';
  is_active: boolean;
  sort_order: string;
}

const emptyProductForm: ProductForm = {
  name: '', category: 'phone', brand: '', price: '', compare_at_price: '', promo_label: '',
  stock: '', description: '', images: [], colors: [], is_featured: false, is_new: false,
  is_active: true, sort_order: '0'
};

const emptyPackForm: PackForm = {
  name: '', price: '', compare_at_price: '', promo_label: '', stock: '', description: '', image: '',
  color: 'dark', is_active: true, sort_order: '0'
};

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  // Forms
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [packForm, setPackForm] = useState<PackForm>(emptyPackForm);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newColorName, setNewColorName] = useState(PRESET_COLORS[0].name);
  const [newColorHex, setNewColorHex] = useState(PRESET_COLORS[0].hex);
  const [newColorStock, setNewColorStock] = useState('0');
  const [uploadingColorImage, setUploadingColorImage] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showOrderFilterDropdown, setShowOrderFilterDropdown] = useState(false);

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataError, setDataError] = useState('');

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      try {
        await verifyToken(token);
        setIsAuthed(true);
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setDataError('');
      const [productData, packData, orderData] = await Promise.all([
        fetchProducts({ admin: true }),
        fetchPacks({ admin: true }),
        fetchOrders()
      ]);
      setProducts(productData);
      setPacks(packData);
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading data:', error);
      setDataError(error instanceof Error ? error.message : 'Impossible de charger les données');
    }
  }, []);

  useEffect(() => {
    if (isAuthed) loadData();
  }, [isAuthed, loadData]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  // ===== PRODUCTS =====
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: String(product.price),
        compare_at_price: product.compare_at_price == null ? '' : String(product.compare_at_price),
        promo_label: product.promo_label || '',
        stock: String(product.stock),
        description: product.description,
        images: product.images || [],
        colors: product.colors || [],
        is_featured: product.is_featured === true,
        is_new: product.is_new === true,
        is_active: product.is_active !== false,
        sort_order: String(product.sort_order || 0)
      });
    } else {
      setEditingProduct(null);
      setProductForm(emptyProductForm);
    }
    setNewColorName(PRESET_COLORS[0].name);
    setNewColorHex(PRESET_COLORS[0].hex);
    setNewColorStock('0');
    setShowProductModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 3 - productForm.images.length;
    if (maxImages <= 0) {
      alert('Maximum 3 images par produit');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, maxImages);
    setUploadingImages(true);

    try {
      const urls = await uploadImages(filesToUpload);
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...urls].slice(0, 3)
      }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement des images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handlePresetColorChange = (name: string) => {
    const preset = PRESET_COLORS.find((c) => c.name === name);
    setNewColorName(name);
    if (preset) setNewColorHex(preset.hex);
  };

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (productForm.colors.length >= 8) {
      alert('Maximum 8 coloris par produit');
      e.target.value = '';
      return;
    }

    if (productForm.colors.some((c) => c.name === newColorName)) {
      alert(`Le coloris "${newColorName}" existe déjà`);
      e.target.value = '';
      return;
    }

    setUploadingColorImage(true);
    try {
      const urls = await uploadImages([files[0]]);
      const imageUrl = urls[0];
      if (!imageUrl) throw new Error('Upload failed');

      setProductForm((prev) => ({
        ...prev,
        colors: [...prev.colors, {
          name: newColorName,
          hex: newColorHex,
          image: imageUrl,
          stock: Math.max(0, Number(newColorStock) || 0),
          available: true,
          sort_order: prev.colors.length,
        }],
      }));
    } catch (error) {
      console.error('Color upload error:', error);
      alert('Erreur lors du téléchargement de l\'image du coloris');
    } finally {
      setUploadingColorImage(false);
      e.target.value = '';
    }
  };

  const removeColor = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const colorImages = productForm.colors.map((c) => c.image).filter(Boolean);
      // Prefer color photos first so the storefront card matches the default coloris
      const images = colorImages.length
        ? [
            ...colorImages,
            ...productForm.images.filter((url) => !colorImages.includes(url)),
          ]
        : productForm.images;

      const data = {
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        price: Number(productForm.price),
        compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : null,
        promo_label: productForm.promo_label,
        stock: Number(productForm.stock),
        description: productForm.description,
        images,
        colors: productForm.colors,
        is_featured: productForm.is_featured,
        is_new: productForm.is_new,
        is_active: productForm.is_active,
        sort_order: Number(productForm.sort_order) || 0
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      setShowProductModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // ===== PACKS =====
  const openPackModal = (pack?: Pack) => {
    if (pack) {
      setEditingPack(pack);
      setPackForm({
        name: pack.name,
        price: String(pack.price),
        compare_at_price: pack.compare_at_price == null ? '' : String(pack.compare_at_price),
        promo_label: pack.promo_label || '',
        stock: String(pack.stock),
        description: pack.description,
        image: pack.image,
        color: pack.color,
        is_active: pack.is_active !== false,
        sort_order: String(pack.sort_order || 0)
      });
    } else {
      setEditingPack(null);
      setPackForm(emptyPackForm);
    }
    setShowPackModal(true);
  };

  const handlePackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const urls = await uploadImages([files[0]]);
      setPackForm(prev => ({ ...prev, image: urls[0] }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setUploadingImages(false);
    }
  };

  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: packForm.name,
        price: Number(packForm.price),
        compare_at_price: packForm.compare_at_price ? Number(packForm.compare_at_price) : null,
        promo_label: packForm.promo_label,
        stock: Number(packForm.stock),
        description: packForm.description,
        image: packForm.image,
        color: packForm.color,
        is_active: packForm.is_active,
        sort_order: Number(packForm.sort_order) || 0
      };

      if (editingPack) {
        await updatePack(editingPack.id, data);
      } else {
        await createPack(data);
      }

      setShowPackModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving pack:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePack = async (id: string) => {
    if (!confirm('Supprimer ce pack ?')) return;
    try {
      await deletePack(id);
      loadData();
    } catch (error) {
      console.error('Error deleting pack:', error);
    }
  };

  // ===== ORDERS =====
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await deleteOrder(id);
      loadData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalProductsCount = products.length;
  const totalPacksCount = packs.length;

  // Filters
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    orderFilter === 'all' ? true : o.status === orderFilter
  );

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'En attente', color: '#f59e0b', icon: Clock },
    confirmed: { label: 'Confirmée', color: '#10b981', icon: Check },
    delivered: { label: 'Livrée', color: '#3b82f6', icon: Truck },
    cancelled: { label: 'Annulée', color: '#ef4444', icon: XCircle }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">NP</div>
            <div>
              <h2>Nasri Phone</h2>
              <span>Admin Panel</span>
            </div>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
          >
            <Package size={20} />
            <span>Produits</span>
            <span className="nav-badge">{totalProductsCount}</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'packs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('packs'); setSidebarOpen(false); }}
          >
            <ShoppingBag size={20} />
            <span>Promo Packs</span>
            <span className="nav-badge">{totalPacksCount}</span>
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
          >
            <ClipboardList size={20} />
            <span>Commandes</span>
            {pendingOrders > 0 && <span className="nav-badge alert">{pendingOrders}</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <div className="hamburger">
              <span></span><span></span><span></span>
            </div>
          </button>
          <h1 className="topbar-title">
            {activeTab === 'products' && 'Gestion des Produits'}
            {activeTab === 'packs' && 'Gestion des Promo Packs'}
            {activeTab === 'orders' && 'Gestion des Commandes'}
          </h1>
          <div className="topbar-right">
            <span className="admin-email">{localStorage.getItem('admin_email')}</span>
          </div>
        </header>

        {dataError && (
          <div className="admin-data-error" role="alert">
            <AlertCircle size={17} />
            <span>{dataError}</span>
            <button type="button" onClick={loadData}>Réessayer</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="admin-stats">
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: '#E9C153' }}>
              <DollarSign size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalRevenue.toLocaleString()} DH</span>
              <span className="stat-label">Revenu Total</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: '#3b82f6' }}>
              <ClipboardList size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Commandes</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <Box size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalProductsCount}</span>
              <span className="stat-label">Produits</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: '#f59e0b' }}>
              <AlertCircle size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{pendingOrders}</span>
              <span className="stat-label">En Attente</span>
            </div>
          </motion.div>
        </div>

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="section-toolbar">
              <div className="toolbar-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <motion.button
                className="toolbar-add-btn"
                onClick={() => openProductModal()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                Ajouter Produit
              </motion.button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Promo</th>
                    <th>Stock</th>
                    <th>Coloris</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-table">
                        <Package size={40} />
                        <p>Aucun produit trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="table-image">
                            {product.image ? (
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <div className="no-image"><Image size={20} /></div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="table-product-name">
                            <strong>{product.name}</strong>
                            {product.brand && <span className="table-brand">{product.brand}</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`category-badge ${product.category}`}>
                            {product.category === 'phone' ? 'Téléphone' : 'Accessoire'}
                          </span>
                        </td>
                        <td className="price-cell">{Number(product.price).toLocaleString()} DH</td>
                        <td>
                          {product.compare_at_price ? (
                            <span className="promo-admin-badge">
                              {product.promo_label || `${Math.round((1 - product.price / product.compare_at_price) * 100)}%`}
                            </span>
                          ) : <span className="table-muted">—</span>}
                        </td>
                        <td>
                          <span className={`stock-badge ${product.stock < 5 ? 'low' : 'ok'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <span className="table-color-count">{product.colors?.length || 0}</span>
                        </td>
                        <td>
                          <span className={`catalog-status-badge ${product.is_active === false ? 'draft' : 'live'}`}>
                            {product.is_active === false ? 'Masqué' : 'En ligne'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit" onClick={() => openProductModal(product)} title="Modifier">
                              <Edit3 size={16} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleDeleteProduct(product.id)} title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PACKS TAB ===== */}
        {activeTab === 'packs' && (
          <div className="admin-section">
            <div className="section-toolbar">
              <div style={{ flex: 1 }}></div>
              <motion.button
                className="toolbar-add-btn"
                onClick={() => openPackModal()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                Ajouter Promo Pack
              </motion.button>
            </div>

            <div className="packs-grid-admin">
              {packs.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={48} />
                  <p>Aucun pack promo</p>
                  <span>Ajoutez votre premier pack promotionnel</span>
                </div>
              ) : (
                packs.map((pack) => (
                  <motion.div
                    key={pack.id}
                    className={`pack-card-admin pack-${pack.color}`}
                    whileHover={{ y: -4 }}
                  >
                    {pack.image && (
                      <div className="pack-card-image">
                        <img src={pack.image} alt={pack.name} />
                      </div>
                    )}
                    <div className="pack-card-body">
                      <span className={`catalog-status-badge ${pack.is_active === false ? 'draft' : 'live'}`}>
                        {pack.is_active === false ? 'Masqué' : 'En ligne'}
                      </span>
                      <h3>{pack.name}</h3>
                      <p className="pack-desc">{pack.description}</p>
                      <div className="pack-card-footer">
                        <span className="pack-card-price">{Number(pack.price).toLocaleString()} DH</span>
                        {pack.compare_at_price && (
                          <span className="pack-card-compare">{Number(pack.compare_at_price).toLocaleString()} DH</span>
                        )}
                        <span className="pack-card-stock">Stock: {pack.stock}</span>
                      </div>
                      <div className="pack-card-actions">
                        <button className="action-btn edit" onClick={() => openPackModal(pack)}>
                          <Edit3 size={16} /> Modifier
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeletePack(pack.id)}>
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <div className="section-toolbar">
              <div className="toolbar-filter-dropdown">
                <button
                  className="filter-dropdown-btn"
                  onClick={() => setShowOrderFilterDropdown(!showOrderFilterDropdown)}
                >
                  <Filter size={16} />
                  {orderFilter === 'all' ? 'Tous' : statusConfig[orderFilter]?.label || orderFilter}
                  <ChevronDown size={16} />
                </button>
                {showOrderFilterDropdown && (
                  <div className="filter-dropdown-menu">
                    {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
                      <button
                        key={s}
                        className={orderFilter === s ? 'active' : ''}
                        onClick={() => { setOrderFilter(s); setShowOrderFilterDropdown(false); }}
                      >
                        {s === 'all' ? 'Tous' : statusConfig[s]?.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="order-count">{filteredOrders.length} commande(s)</span>
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <p>Aucune commande</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Clock;
                  return (
                    <motion.div
                      key={order.id}
                      className="order-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="order-card-header">
                        <div className="order-id">
                          <span>#{order.id.slice(0, 8)}</span>
                          <span className="order-date">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span
                          className="order-status-badge"
                          style={{ background: `${statusConfig[order.status]?.color}20`, color: statusConfig[order.status]?.color }}
                        >
                          <StatusIcon size={14} />
                          {statusConfig[order.status]?.label}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-customer">
                          <h4>{order.first_name} {order.last_name}</h4>
                          <p><strong>📱</strong> {order.phone_number}</p>
                          <p><strong>🏙️</strong> {order.city}</p>
                          <p><strong>📍</strong> {order.address}</p>
                        </div>

                        <div className="order-items">
                          <h4>Produits commandés:</h4>
                          {Array.isArray(order.products_json) && order.products_json.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <span>{item.name}{item.color ? ` · ${item.color}` : ''} ×{item.quantity}</span>
                              <span>{(Number(item.price) * item.quantity).toLocaleString()} DH</span>
                            </div>
                          ))}
                          <div className="order-total-row">
                            <strong>Total</strong>
                            <strong>{Number(order.total_amount).toLocaleString()} DH</strong>
                          </div>
                        </div>
                      </div>

                      <div className="order-card-actions">
                        <div className="status-buttons">
                          {['pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
                            <button
                              key={s}
                              className={`status-btn ${order.status === s ? 'active' : ''}`}
                              style={{
                                borderColor: statusConfig[s]?.color,
                                ...(order.status === s ? { background: statusConfig[s]?.color, color: '#fff' } : { color: statusConfig[s]?.color })
                              }}
                              onClick={() => handleStatusChange(order.id, s)}
                              disabled={order.status === s}
                            >
                              {statusConfig[s]?.label}
                            </button>
                          ))}
                        </div>
                        <button className="action-btn delete" onClick={() => handleDeleteOrder(order.id)}>
                          <Trash2 size={16} /> Supprimer
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* ===== PRODUCT MODAL ===== */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
            />
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="admin-modal-content admin-editor-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 36, stiffness: 420 }}
              >
              <div className="modal-header">
                <h2>{editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}</h2>
                <button className="modal-close" onClick={() => setShowProductModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="modal-form">
                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label>Nom du Produit *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Ex: iPhone 15 Pro Max"
                      required
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Marque</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="Ex: Apple"
                    />
                  </div>
                </div>

                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label>Catégorie *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as 'phone' | 'accessory' })}
                    >
                      <option value="phone">📱 Téléphone</option>
                      <option value="accessory">🎧 Accessoire</option>
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label>Prix (DH) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Stock *</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label>Prix avant promo (DH)</label>
                    <input
                      type="number"
                      value={productForm.compare_at_price}
                      onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                      placeholder="Laisser vide sans promotion"
                      min="0"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Libellé promo</label>
                    <input
                      type="text"
                      value={productForm.promo_label}
                      onChange={(e) => setProductForm({ ...productForm, promo_label: e.target.value })}
                      placeholder="Ex: OFFRE ÉTÉ"
                      maxLength={32}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Ordre d’affichage</label>
                    <input
                      type="number"
                      value={productForm.sort_order}
                      onChange={(e) => setProductForm({ ...productForm, sort_order: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-switches" aria-label="Visibilité du produit">
                  <label><input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} /> En ligne</label>
                  <label><input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} /> En vedette</label>
                  <label><input type="checkbox" checked={productForm.is_new} onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })} /> Nouveau</label>
                </div>

                <div className="form-group-admin">
                  <label>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Description du produit..."
                    rows={3}
                  />
                </div>

                <div className="form-group-admin">
                  <label>
                    Images ({productForm.images.length}/3)
                    {uploadingImages && <span className="uploading-badge">Téléchargement...</span>}
                  </label>
                  <div className="images-preview">
                    {productForm.images.map((url, idx) => (
                      <div key={idx} className="image-preview-item">
                        <img src={url} alt={`Image ${idx + 1}`} />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {productForm.images.length < 3 && (
                      <label className="image-upload-btn">
                        <Upload size={24} />
                        <span>Ajouter</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {productForm.category === 'phone' && (
                  <div className="form-group-admin">
                    <label>
                      Coloris ({productForm.colors.length}/8)
                      {uploadingColorImage && <span className="uploading-badge">Téléchargement...</span>}
                    </label>
                    <p className="form-hint">
                      Ajoutez chaque coloris avec sa photo. Sur la boutique, cliquer un coloris change l&apos;image.
                    </p>

                    {productForm.colors.length > 0 && (
                      <div className="colors-admin-list">
                        {productForm.colors.map((color, idx) => (
                          <div key={`${color.name}-${idx}`} className="color-admin-item">
                            <img src={color.image} alt={color.name} />
                            <span
                              className="color-admin-swatch"
                              style={{ backgroundColor: color.hex }}
                              aria-hidden="true"
                            />
                            <span className="color-admin-name">{color.name}</span>
                            <label className="color-stock-field">
                              <span>Stock</span>
                              <input
                                type="number"
                                min="0"
                                value={color.stock ?? (Number(productForm.stock) || 0)}
                                onChange={(e) => setProductForm((prev) => ({
                                  ...prev,
                                  colors: prev.colors.map((item, colorIndex) => colorIndex === idx
                                    ? { ...item, stock: Math.max(0, Number(e.target.value) || 0) }
                                    : item),
                                }))}
                              />
                            </label>
                            <label className="color-availability">
                              <input
                                type="checkbox"
                                checked={color.available !== false}
                                onChange={(e) => setProductForm((prev) => ({
                                  ...prev,
                                  colors: prev.colors.map((item, colorIndex) => colorIndex === idx
                                    ? { ...item, available: e.target.checked }
                                    : item),
                                }))}
                              />
                              Disponible
                            </label>
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeColor(idx)}
                              aria-label={`Supprimer ${color.name}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {productForm.colors.length < 8 && (
                      <div className="color-add-row">
                        <select
                          value={newColorName}
                          onChange={(e) => handlePresetColorChange(e.target.value)}
                          aria-label="Nom du coloris"
                        >
                          {PRESET_COLORS.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <label className="color-hex-picker" title="Couleur du pastille">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                          />
                        </label>
                        <input
                          className="color-stock-new"
                          type="number"
                          min="0"
                          value={newColorStock}
                          onChange={(e) => setNewColorStock(e.target.value)}
                          aria-label="Stock du nouveau coloris"
                          placeholder="Stock"
                        />
                        <label className={`image-upload-btn color-image-upload ${uploadingColorImage ? 'disabled' : ''}`}>
                          <Upload size={20} />
                          <span>Image du coloris</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleColorImageUpload}
                            disabled={uploadingColorImage}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowProductModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-save">
                    {editingProduct ? 'Mettre à jour' : 'Créer Produit'}
                  </button>
                </div>
              </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== PACK MODAL ===== */}
      <AnimatePresence>
        {showPackModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPackModal(false)}
            />
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="admin-modal-content admin-editor-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 36, stiffness: 420 }}
              >
              <div className="modal-header">
                <h2>{editingPack ? 'Modifier Pack' : 'Nouveau Pack Promo'}</h2>
                <button className="modal-close" onClick={() => setShowPackModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePackSubmit} className="modal-form">
                <div className="form-group-admin">
                  <label>Nom du Pack *</label>
                  <input
                    type="text"
                    value={packForm.name}
                    onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                    placeholder="Ex: Pack Premium"
                    required
                  />
                </div>

                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label>Prix (DH) *</label>
                    <input
                      type="number"
                      value={packForm.price}
                      onChange={(e) => setPackForm({ ...packForm, price: e.target.value })}
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Stock *</label>
                    <input
                      type="number"
                      value={packForm.stock}
                      onChange={(e) => setPackForm({ ...packForm, stock: e.target.value })}
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Couleur</label>
                    <select
                      value={packForm.color}
                      onChange={(e) => setPackForm({ ...packForm, color: e.target.value as 'dark' | 'yellow' | 'red' })}
                    >
                      <option value="dark">🖤 Sombre</option>
                      <option value="yellow">💛 Jaune</option>
                      <option value="red">❤️ Rouge</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-admin">
                  <div className="form-group-admin">
                    <label>Prix avant promo (DH)</label>
                    <input
                      type="number"
                      value={packForm.compare_at_price}
                      onChange={(e) => setPackForm({ ...packForm, compare_at_price: e.target.value })}
                      placeholder="Laisser vide sans promotion"
                      min="0"
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Libellé promo</label>
                    <input
                      type="text"
                      value={packForm.promo_label}
                      onChange={(e) => setPackForm({ ...packForm, promo_label: e.target.value })}
                      placeholder="Ex: PACK DU MOMENT"
                      maxLength={32}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Ordre d’affichage</label>
                    <input
                      type="number"
                      value={packForm.sort_order}
                      onChange={(e) => setPackForm({ ...packForm, sort_order: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-switches">
                  <label><input type="checkbox" checked={packForm.is_active} onChange={(e) => setPackForm({ ...packForm, is_active: e.target.checked })} /> Pack en ligne</label>
                </div>

                <div className="form-group-admin">
                  <label>Description *</label>
                  <textarea
                    value={packForm.description}
                    onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                    placeholder="Ex: Téléphone + Écouteurs + Câble Original"
                    required
                    rows={3}
                  />
                </div>

                <div className="form-group-admin">
                  <label>
                    Image du Pack
                    {uploadingImages && <span className="uploading-badge">Téléchargement...</span>}
                  </label>
                  <div className="images-preview">
                    {packForm.image && (
                      <div className="image-preview-item">
                        <img src={packForm.image} alt="Pack" />
                        <button type="button" className="remove-image-btn" onClick={() => setPackForm({ ...packForm, image: '' })}>
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {!packForm.image && (
                      <label className="image-upload-btn">
                        <Upload size={24} />
                        <span>Ajouter</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePackImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowPackModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-save">
                    {editingPack ? 'Mettre à jour' : 'Créer Pack'}
                  </button>
                </div>
              </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
