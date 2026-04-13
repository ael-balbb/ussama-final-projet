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
import type { Product, Pack, Order } from '../types';
import './AdminPanel.css';

type Tab = 'products' | 'packs' | 'orders';

interface ProductForm {
  name: string;
  category: 'phone' | 'accessory';
  brand: string;
  price: string;
  stock: string;
  description: string;
  images: string[];
}

interface PackForm {
  name: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  color: 'dark' | 'yellow' | 'red';
}

const emptyProductForm: ProductForm = {
  name: '', category: 'phone', brand: '', price: '', stock: '', description: '', images: []
};

const emptyPackForm: PackForm = {
  name: '', price: '', stock: '', description: '', image: '', color: 'dark'
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showOrderFilterDropdown, setShowOrderFilterDropdown] = useState(false);

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const [productData, packData, orderData] = await Promise.all([
        fetchProducts(),
        fetchPacks(),
        fetchOrders()
      ]);
      setProducts(productData);
      setPacks(packData);
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading data:', error);
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
        stock: String(product.stock),
        description: product.description,
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setProductForm(emptyProductForm);
    }
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        description: productForm.description,
        images: productForm.images
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
      alert('Erreur lors de la sauvegarde');
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
        stock: String(pack.stock),
        description: pack.description,
        image: pack.image,
        color: pack.color
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
        stock: Number(packForm.stock),
        description: packForm.description,
        image: packForm.image,
        color: packForm.color
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
      alert('Erreur lors de la sauvegarde');
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

        {/* Stats Cards */}
        <div className="admin-stats">
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #E9C153, #D4AD43)' }}>
              <DollarSign size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalRevenue.toLocaleString()} DH</span>
              <span className="stat-label">Revenu Total</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <ClipboardList size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Commandes</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Box size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalProductsCount}</span>
              <span className="stat-label">Produits</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
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
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-table">
                        <Package size={40} />
                        <p>Aucun produit trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="table-image">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} />
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
                          <span className={`stock-badge ${product.stock < 5 ? 'low' : 'ok'}`}>
                            {product.stock}
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
                      <h3>{pack.name}</h3>
                      <p className="pack-desc">{pack.description}</p>
                      <div className="pack-card-footer">
                        <span className="pack-card-price">{Number(pack.price).toLocaleString()} DH</span>
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
                              <span>{item.name} ×{item.quantity}</span>
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
                className="admin-modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
                className="admin-modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
