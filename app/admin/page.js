"use client";

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Login Form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginAlert, setLoginAlert] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalInquiries: 0
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [searchProd, setSearchProd] = useState("");

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editProdId, setEditProdId] = useState(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Fridges");
  const [prodBrand, setProdBrand] = useState("Dawlance");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodBadge, setProdBadge] = useState("");
  const [prodBadgeText, setProdBadgeText] = useState("");
  const [imgMode, setImgMode] = useState("upload"); // 'upload' or 'url'
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("singer_admin_token");
    const headers = {
      ...(options.headers || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem("singer_admin_token");
      setIsAuthenticated(false);
      throw new Error("Unauthorized");
    }
    return res;
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("singer_admin_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setCurrentAdmin(data.admin);
        setIsAuthenticated(true);
        loadAllData();
      } else {
        localStorage.removeItem("singer_admin_token");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginAlert("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("singer_admin_token", data.token);
        setCurrentAdmin(data.admin);
        setIsAuthenticated(true);
        showToast("Login kamyab raha!", "success");
        loadAllData();
      } else {
        setLoginAlert(data.error || "Ghalat credentials!");
      }
    } catch (err) {
      setLoginAlert("Server se rabta nahi ho saka.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Logout karna chahte hain?")) {
      localStorage.removeItem("singer_admin_token");
      setIsAuthenticated(false);
      setCurrentAdmin(null);
    }
  };

  const loadAllData = async () => {
    loadStats();
    loadProducts();
    loadOrders();
    loadInquiries();
  };

  const loadStats = async () => {
    try {
      const res = await authFetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {}
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {}
  };

  const loadOrders = async () => {
    try {
      const res = await authFetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {}
  };

  const loadInquiries = async () => {
    try {
      const res = await authFetch("/api/inquiries");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (e) {}
  };

  // Product CRUD
  const openAddModal = () => {
    setEditProdId(null);
    setProdName("");
    setProdCategory("Fridges");
    setProdBrand("Dawlance");
    setProdPrice("");
    setProdOldPrice("");
    setProdBadge("");
    setProdBadgeText("");
    setImgMode("upload");
    setImgUrlInput("");
    setProdImageUrl("");
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditProdId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdBrand(prod.brand);
    setProdPrice(prod.price);
    setProdOldPrice(prod.oldPrice || "");
    setProdBadge(prod.badge || "");
    setProdBadgeText(prod.badgeText || "");
    setProdImageUrl(prod.image || "");

    const isWeb = prod.image && (prod.image.startsWith("http://") || prod.image.startsWith("https://"));
    if (isWeb) {
      setImgMode("url");
      setImgUrlInput(prod.image);
    } else {
      setImgMode("upload");
    }
    setIsProductModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("product_image", file);

    try {
      const res = await authFetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProdImageUrl(data.imageUrl);
        showToast("Tasveer upload ho gayi!", "success");
      } else {
        showToast(data.error || "Upload fail", "error");
      }
    } catch (err) {
      showToast("Upload error", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      showToast("Naam aur price zaroori hain", "error");
      return;
    }

    const payload = {
      name: prodName,
      category: prodCategory,
      brand: prodBrand,
      price: Number(prodPrice),
      oldPrice: prodOldPrice ? Number(prodOldPrice) : null,
      badge: prodBadge,
      badgeText: prodBadgeText,
      image: prodImageUrl || "images/shop_front.jpg"
    };

    const method = editProdId ? "PUT" : "POST";
    const url = editProdId ? `/api/products/${editProdId}` : "/api/products";

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editProdId ? "Product update ho gaya!" : "Naya product shamil ho gaya!", "success");
        setIsProductModalOpen(false);
        loadProducts();
        loadStats();
      } else {
        showToast(data.error || "Ghalti hui", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Product delete karna chahte hain?")) return;
    try {
      const res = await authFetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product delete ho gaya!", "success");
        loadProducts();
        loadStats();
      }
    } catch (e) {}
  };

  // Orders Actions
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await authFetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${id} status: ${status}`, "success");
        loadOrders();
        loadStats();
      }
    } catch (e) {}
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm(`Order #${id} delete karein?`)) return;
    try {
      const res = await authFetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Order delete ho gaya!", "success");
        loadOrders();
        loadStats();
      }
    } catch (e) {}
  };

  // Inquiry Action
  const handleDeleteInquiry = async (id) => {
    if (!confirm("Message delete karein?")) return;
    try {
      const res = await authFetch(`/api/inquiries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Message delete ho gaya!", "success");
        loadInquiries();
        loadStats();
      }
    } catch (e) {}
  };

  // Filtered Products for Admin
  const filteredProds = products.filter(p =>
    p.name.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProd.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="login-overlay" style={{ display: 'flex' }}>
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h2>Admin Portal Login</h2>
            <p>Singer Digital Control Panel mein dakhil honay ke liye credentials enter karein</p>
          </div>

          {loginAlert && <div className="login-alert" style={{ display: 'block' }}>{loginAlert}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="e.g. admin"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? 'Check ho raha hai...' : '🔓 Login Karein'}
            </button>
            <div className="login-hint">
              <span>💡 Default Login: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <span className="logo-icon">🏪</span>
          <div>
            <div className="logo-title">Singer <span>Digital</span></div>
            <div className="logo-badge">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#overview"
            className={`nav-item ${currentTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('overview'); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </a>
          <a
            href="#products"
            className={`nav-item ${currentTab === 'products' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('products'); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">🛍️</span>
            <span>Products Manager</span>
            <span className="nav-count">{stats.totalProducts}</span>
          </a>
          <a
            href="#orders"
            className={`nav-item ${currentTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('orders'); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">📦</span>
            <span>Orders</span>
            <span className="nav-count alert">{stats.pendingOrders}</span>
          </a>
          <a
            href="#inquiries"
            className={`nav-item ${currentTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('inquiries'); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">📩</span>
            <span>Messages</span>
            <span className="nav-count">{stats.totalInquiries}</span>
          </a>
          <a href="/" target="_blank" className="nav-item view-site">
            <span className="nav-icon">🌐</span>
            <span>View Website ↗</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="shop-location">📍 Alipur Chatha, Gujranwala Rd</div>
          <div className="shop-status">🟢 Next.js Full Stack Server Online</div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <h2 className="header-page-title">
            {currentTab === 'overview' && 'Dashboard Overview'}
            {currentTab === 'products' && 'Products Management'}
            {currentTab === 'orders' && 'Customer Orders'}
            {currentTab === 'inquiries' && 'Messages & Inquiries'}
          </h2>
          <div className="header-actions">
            <button className="btn-primary" onClick={openAddModal}>➕ Naya Product</button>
            <a href="/" target="_blank" className="btn-outline">🛒 Live Shop</a>
            <div className="admin-user-pill">
              <span className="user-avatar">👤</span>
              <span className="user-name">{currentAdmin?.name || 'Admin'}</span>
              <button className="btn-logout" onClick={handleLogout} title="Logout">🚪</button>
            </div>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {currentTab === 'overview' && (
          <section className="tab-pane active">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">🛍️</div>
                <div className="stat-info">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{stats.totalProducts}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">📦</div>
                <div className="stat-info">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">{stats.totalOrders}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon yellow">⏳</div>
                <div className="stat-info">
                  <div className="stat-label">Pending Orders</div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">💰</div>
                <div className="stat-info">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">Rs. {Number(stats.totalRevenue).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <h3>📦 Recent Orders</h3>
                <button className="btn-outline btn-sm" onClick={() => setCurrentTab('orders')}>Tamam Orders Dekhein →</button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).length === 0 ? (
                      <tr><td colSpan="7" className="text-center" style={{ padding: '24px', color: '#94a3b8' }}>Abhi koi order nahi aaya</td></tr>
                    ) : (
                      orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>{o.customer_name}</td>
                          <td>{o.customer_phone}</td>
                          <td>{o.items ? o.items.length : 0} items</td>
                          <td><strong>Rs. {Number(o.total_amount).toLocaleString()}</strong></td>
                          <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                          <td>
                            <a
                              href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum!%20Singer%20Digital%20se%20aapka%20order%20#${o.id}%20confirm%20karna%20chahte%20hain.`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-whatsapp btn-sm"
                            >
                              💬 WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Products Manager */}
        {currentTab === 'products' && (
          <section className="tab-pane active">
            <div className="card">
              <div className="card-header flex-wrap">
                <div>
                  <h3>🛍️ Tamam Products List</h3>
                  <p className="card-subtitle">Products edit karein ya naya product shamil karein</p>
                </div>
                <div className="header-filters">
                  <input
                    type="text"
                    value={searchProd}
                    onChange={e => setSearchProd(e.target.value)}
                    placeholder="Search product..."
                  />
                  <button className="btn-primary" onClick={openAddModal}>➕ Add Product</button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pic</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Price (Rs.)</th>
                      <th>Old Price</th>
                      <th>Badge</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProds.length === 0 ? (
                      <tr><td colSpan="8" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>Koi product nahi mila</td></tr>
                    ) : (
                      filteredProds.map(prod => (
                        <tr key={prod.id}>
                          <td>
                            <img src={prod.image} alt={prod.name} className="prod-thumb" onError={e => e.target.src = 'images/shop_front.jpg'} />
                          </td>
                          <td><strong>{prod.name}</strong></td>
                          <td><span className="status-badge Confirmed">{prod.category}</span></td>
                          <td><strong>{prod.brand}</strong></td>
                          <td><span style={{ fontWeight: 700, color: '#1e40af' }}>Rs. {Number(prod.price).toLocaleString()}</span></td>
                          <td>{prod.oldPrice ? <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>Rs. {Number(prod.oldPrice).toLocaleString()}</span> : '—'}</td>
                          <td>{prod.badgeText ? <span className={`status-badge ${prod.badge === 'hot' ? 'Cancelled' : 'Pending'}`}>{prod.badgeText}</span> : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn-outline btn-sm" onClick={() => openEditModal(prod)}>✏️ Edit</button>
                              <button className="btn-danger btn-sm" onClick={() => handleDeleteProduct(prod.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Orders */}
        {currentTab === 'orders' && (
          <section className="tab-pane active">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>📦 Tamam Orders</h3>
                  <p className="card-subtitle">Website checkout se aane walay orders</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>Address</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="8" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>Abhi koi order record mein nahi hai</td></tr>
                    ) : (
                      orders.map(o => {
                        const itemsList = o.items ? o.items.map(i => `${i.name} (x${i.qty})`).join(", ") : "—";
                        return (
                          <tr key={o.id}>
                            <td><strong>#{o.id}</strong></td>
                            <td><strong>{o.customer_name}</strong></td>
                            <td><a href={`tel:${o.customer_phone}`} style={{ color: '#2563eb', fontWeight: 600 }}>{o.customer_phone}</a></td>
                            <td><small>{o.customer_address || 'Alipur Chatha'}</small></td>
                            <td><small style={{ color: '#475569' }}>{itemsList}</small></td>
                            <td><strong style={{ color: '#1e40af' }}>Rs. {Number(o.total_amount).toLocaleString()}</strong></td>
                            <td>
                              <select
                                value={o.status}
                                onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.8rem' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <a
                                  href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum!%20Singer%20Digital%20se%20aapka%20order%20#${o.id}%20confirm%20karna%20chahte%20hain.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-whatsapp btn-sm"
                                >
                                  💬 WhatsApp
                                </a>
                                <button className="btn-danger btn-sm" onClick={() => handleDeleteOrder(o.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Messages */}
        {currentTab === 'inquiries' && (
          <section className="tab-pane active">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>📩 Customer Messages & Inquiries</h3>
                  <p className="card-subtitle">Website ke contact form se aane walay sawalaat</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer Name</th>
                      <th>Phone / WhatsApp</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr><td colSpan="6" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>Koi naya message nahi mila</td></tr>
                    ) : (
                      inquiries.map(m => (
                        <tr key={m.id}>
                          <td>#{m.id}</td>
                          <td><strong>{m.name}</strong></td>
                          <td><a href={`tel:${m.phone}`} style={{ color: '#2563eb', fontWeight: 600 }}>{m.phone}</a></td>
                          <td><span className="status-badge Confirmed">{m.subject || 'General'}</span></td>
                          <td><p style={{ maxWidth: '320px', fontSize: '0.85rem', color: '#334155' }}>{m.message}</p></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <a
                                href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum%20${encodeURIComponent(m.name)}!%20Singer%20Digital%20se%20aapke%20sawal%20ke%20jawab%20mein%20rabta%20kar%20rahe%20hain.`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-whatsapp btn-sm"
                              >
                                💬 Reply
                              </a>
                              <button className="btn-danger btn-sm" onClick={() => handleDeleteInquiry(m.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay open" style={{ display: 'flex' }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editProdId ? '✏️ Product Edit Karein' : '➕ Naya Product Add Karein'}</h3>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product ka Naam *</label>
                <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="e.g. Dawlance Inverter AC 1.5 Ton" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} required>
                    <option value="Fridges">Fridges</option>
                    <option value="Washing Machines">Washing Machines</option>
                    <option value="AC">Air Conditioners (AC)</option>
                    <option value="LED">LED TVs</option>
                    <option value="Air Fryer">Air Fryer</option>
                    <option value="Electric Kaital">Electric Kaital</option>
                    <option value="Food Processor">Food Processor</option>
                    <option value="Mobile Phones">Mobile Phones</option>
                    <option value="Motor Bike">Motor Bikes</option>
                    <option value="Deep Freezers">Deep Freezers</option>
                    <option value="Iron">Iron / Istari</option>
                    <option value="Microwave">Microwave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <select value={prodBrand} onChange={e => setProdBrand(e.target.value)} required>
                    <option value="Dawlance">Dawlance</option>
                    <option value="Philips">Philips</option>
                    <option value="Haier">Haier</option>
                    <option value="TCL">TCL</option>
                    <option value="Gree">Gree</option>
                    <option value="Orient">Orient</option>
                    <option value="Multinet">Multinet</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Apple">Apple</option>
                    <option value="Honda">Honda</option>
                    <option value="National">National</option>
                    <option value="Super Asia">Super Asia</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sale Price (Rs.) *</label>
                  <input type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="e.g. 145000" required />
                </div>
                <div className="form-group">
                  <label>Old Price (Discount)</label>
                  <input type="number" value={prodOldPrice} onChange={e => setProdOldPrice(e.target.value)} placeholder="e.g. 165000" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Badge Type</label>
                  <select value={prodBadge} onChange={e => setProdBadge(e.target.value)}>
                    <option value="">No Badge</option>
                    <option value="hot">Hot</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge Text</label>
                  <input type="text" value={prodBadgeText} onChange={e => setProdBadgeText(e.target.value)} placeholder="e.g. 10% OFF" />
                </div>
              </div>

              <div className="form-group">
                <label>Product Picture (Tasveer)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className={`btn-outline btn-sm ${imgMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setImgMode('upload')}
                    style={{ flex: 1, padding: '8px', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    📁 Computer / Phone Upload
                  </button>
                  <button
                    type="button"
                    className={`btn-outline btn-sm ${imgMode === 'url' ? 'active' : ''}`}
                    onClick={() => setImgMode('url')}
                    style={{ flex: 1, padding: '8px', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    🌐 Google / Web Link Paste
                  </button>
                </div>

                {imgMode === 'upload' ? (
                  <div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} />
                    {uploadingImage && <p style={{ fontSize: '0.8rem', color: '#2563eb' }}>Uploading...</p>}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={imgUrlInput}
                      onChange={e => { setImgUrlInput(e.target.value); setProdImageUrl(e.target.value.trim()); }}
                      placeholder="https://... (Google Image link paste karein)"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                      💡 Google se image ka address copy karke yahan paste karein.
                    </p>
                  </div>
                )}

                {prodImageUrl && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img src={prodImageUrl} alt="Preview" style={{ maxHeight: '100px', borderRadius: '6px' }} onError={e => e.target.src = 'images/shop_front.jpg'} />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">💾 Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast ${t.type}`}>
            <span>{t.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
