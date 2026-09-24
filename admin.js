// ==========================================
// Singer Digital - Admin Dashboard Logic
// ==========================================

let allProducts = [];
let allOrders = [];
let allInquiries = [];
let currentAdmin = null;

// Auth Fetch Helper (automatically attaches Bearer token & handles 401)
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("singer_admin_token");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("singer_admin_token");
    localStorage.removeItem("singer_admin_user");
    showLoginOverlay("Aapka session khatam ho gaya hai. Dobara login karein.");
    throw new Error("Unauthorized");
  }
  return res;
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndInit();
});

// Authentication Check
async function checkAuthAndInit() {
  const token = localStorage.getItem("singer_admin_token");
  if (!token) {
    showLoginOverlay();
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.admin) {
      currentAdmin = data.admin;
      updateAdminUI(currentAdmin);
      hideLoginOverlay();
      loadDashboardData();
    } else {
      localStorage.removeItem("singer_admin_token");
      showLoginOverlay();
    }
  } catch (err) {
    console.error("Auth check error:", err);
    showLoginOverlay();
  }
}

function loadDashboardData() {
  loadStats();
  loadProducts();
  loadOrders();
  loadInquiries();
}

function updateAdminUI(admin) {
  const nameEl = document.getElementById("adminUserName");
  if (nameEl && admin) {
    nameEl.innerText = admin.name || admin.username || "Admin";
  }
}

function showLoginOverlay(message = "") {
  const overlay = document.getElementById("adminLoginOverlay");
  const alertEl = document.getElementById("loginAlert");
  if (overlay) overlay.style.display = "flex";
  if (alertEl) {
    if (message) {
      alertEl.innerText = message;
      alertEl.style.display = "block";
    } else {
      alertEl.style.display = "none";
    }
  }
}

function hideLoginOverlay() {
  const overlay = document.getElementById("adminLoginOverlay");
  if (overlay) overlay.style.display = "none";
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;
  const alertEl = document.getElementById("loginAlert");
  const btn = document.getElementById("loginSubmitBtn");

  if (!username || !password) return;

  btn.disabled = true;
  btn.innerText = "Check ho raha hai...";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem("singer_admin_token", data.token);
      localStorage.setItem("singer_admin_user", JSON.stringify(data.admin));
      currentAdmin = data.admin;
      updateAdminUI(currentAdmin);
      hideLoginOverlay();
      showToast("Khush amdeed! Admin Panel mein login kamyab raha.", "success");
      loadDashboardData();
    } else {
      alertEl.innerText = data.error || "Ghalat username ya password!";
      alertEl.style.display = "block";
    }
  } catch (err) {
    alertEl.innerText = "Server se rabta nahi ho saka!";
    alertEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "🔓 Login Karein";
  }
}

function handleAdminLogout() {
  if (confirm("Kya aap Admin panel se logout hona chahte hain?")) {
    localStorage.removeItem("singer_admin_token");
    localStorage.removeItem("singer_admin_user");
    currentAdmin = null;
    showToast("Aap logout ho chuke hain.", "success");
    showLoginOverlay();
  }
}

// Tab Navigation
function switchTab(tabId) {
  document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.add("active");

  const navLink = document.querySelector(`.sidebar-nav a[href="#${tabId}"]`);
  if (navLink) navLink.classList.add("active");

  const titleMap = {
    overview: "Dashboard Overview",
    products: "Products Management",
    orders: "Customer Orders",
    inquiries: "Messages & Inquiries"
  };
  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.innerText = titleMap[tabId] || "Dashboard";

  // Close mobile sidebar if open
  const sidebar = document.getElementById("adminSidebar");
  if (sidebar) sidebar.classList.remove("open");
}

function toggleSidebar() {
  const sidebar = document.getElementById("adminSidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

// ==========================================
// 1. STATS
// ==========================================
async function loadStats() {
  try {
    const res = await authFetch("/api/stats");
    const data = await res.json();
    if (data.success) {
      document.getElementById("statProducts").innerText = data.stats.totalProducts;
      document.getElementById("statOrders").innerText = data.stats.totalOrders;
      document.getElementById("statPending").innerText = data.stats.pendingOrders;
      document.getElementById("statRevenue").innerText = `Rs. ${Number(data.stats.totalRevenue).toLocaleString()}`;

      document.getElementById("navProdCount").innerText = data.stats.totalProducts;
      document.getElementById("navOrdersCount").innerText = data.stats.pendingOrders;
      document.getElementById("navInqCount").innerText = data.stats.totalInquiries;
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// ==========================================
// 2. PRODUCTS MANAGEMENT
// ==========================================
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) {
      allProducts = data.products;
      renderAdminProducts(allProducts);
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function renderAdminProducts(list) {
  const tbody = document.getElementById("adminProductsBody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:40px;color:#94a3b8;">Koi product nahi mila</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(prod => `
    <tr>
      <td>
        <img src="${prod.image}" alt="${prod.name}" class="prod-thumb" onerror="this.src='images/shop_front.jpg'" />
      </td>
      <td>
        <strong>${prod.name}</strong>
      </td>
      <td><span class="status-badge Confirmed">${prod.category}</span></td>
      <td><strong>${prod.brand}</strong></td>
      <td>
        <span style="font-weight:700;color:#1e40af;">Rs. ${Number(prod.price).toLocaleString()}</span>
      </td>
      <td>${prod.oldPrice ? `<span style="text-decoration:line-through;color:#94a3b8;">Rs. ${Number(prod.oldPrice).toLocaleString()}</span>` : "—"}</td>
      <td>
        ${prod.badgeText ? `<span class="status-badge ${prod.badge === 'hot' ? 'Cancelled' : 'Pending'}">${prod.badgeText}</span>` : "—"}
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-outline btn-sm" onclick="editProduct(${prod.id})" title="Edit Product">✏️ Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteProduct(${prod.id})" title="Delete Product">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterAdminProducts() {
  const query = document.getElementById("adminSearchProd")?.value.toLowerCase() || "";
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  renderAdminProducts(filtered);
}

// Modal handling
function openAddProductModal() {
  document.getElementById("modalTitle").innerText = "➕ Naya Product Add Karein";
  document.getElementById("editProductId").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("prodImageUrl").value = "";
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("dropzoneContent").style.display = "block";
  document.getElementById("productModal").classList.add("open");
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

function editProduct(id) {
  const prod = allProducts.find(p => p.id === id);
  if (!prod) return;

  document.getElementById("modalTitle").innerText = "✏️ Product Edit Karein";
  document.getElementById("editProductId").value = prod.id;
  document.getElementById("prodName").value = prod.name;
  document.getElementById("prodCategory").value = prod.category;
  document.getElementById("prodBrand").value = prod.brand;
  document.getElementById("prodPrice").value = prod.price;
  document.getElementById("prodOldPrice").value = prod.oldPrice || "";
  document.getElementById("prodBadge").value = prod.badge || "";
  document.getElementById("prodBadgeText").value = prod.badgeText || "";
  document.getElementById("prodImageUrl").value = prod.image || "";

  if (prod.image) {
    const preview = document.getElementById("imagePreview");
    preview.src = prod.image;
    preview.style.display = "block";
    document.getElementById("dropzoneContent").style.display = "none";
  }

  document.getElementById("productModal").classList.add("open");
}

async function previewImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("product_image", file);

  const preview = document.getElementById("imagePreview");
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  document.getElementById("dropzoneContent").style.display = "none";

  try {
    showToast("Picture upload ho rahi hai...", "success");
    const res = await authFetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("prodImageUrl").value = data.imageUrl;
      showToast("Picture upload ho gayi!", "success");
    } else {
      showToast("Upload fail ho gaya", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Upload error", "error");
  }
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("editProductId").value;
  const name = document.getElementById("prodName").value.trim();
  const category = document.getElementById("prodCategory").value;
  const brand = document.getElementById("prodBrand").value;
  const price = Number(document.getElementById("prodPrice").value);
  const oldPrice = document.getElementById("prodOldPrice").value ? Number(document.getElementById("prodOldPrice").value) : null;
  const badge = document.getElementById("prodBadge").value;
  const badgeText = document.getElementById("prodBadgeText").value.trim();
  const image = document.getElementById("prodImageUrl").value.trim() || "images/shop_front.jpg";

  const payload = { name, category, brand, price, oldPrice, badge, badgeText, image };
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/products/${id}` : "/api/products";

  try {
    const res = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(id ? "Product update ho gaya!" : "Naya product shamil ho gaya!", "success");
      closeProductModal();
      loadProducts();
      loadStats();
    } else {
      showToast(data.error || "Ghalti hui", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error", "error");
  }
}

async function deleteProduct(id) {
  if (!confirm("Kya aap waqai yeh product delete karna chahte hain?")) return;

  try {
    const res = await authFetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Product delete ho gaya!", "success");
      loadProducts();
      loadStats();
    }
  } catch (err) {
    console.error(err);
    showToast("Delete error", "error");
  }
}

// ==========================================
// 3. ORDERS MANAGEMENT
// ==========================================
async function loadOrders() {
  try {
    const res = await authFetch("/api/orders");
    const data = await res.json();
    if (data.success) {
      allOrders = data.orders;
      renderRecentOrders(allOrders.slice(0, 5));
      renderAllOrders(allOrders);
    }
  } catch (err) {
    console.error("Error loading orders:", err);
  }
}

function renderRecentOrders(list) {
  const tbody = document.getElementById("recentOrdersBody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:24px;color:#94a3b8;">Abhi koi order nahi aaya</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer_name}</td>
      <td>${o.customer_phone}</td>
      <td>${o.items ? o.items.length : 0} items</td>
      <td><strong>Rs. ${Number(o.total_amount).toLocaleString()}</strong></td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
      <td>
        <a href="https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum!%20Singer%20Digital%20se%20aapka%20order%20#${o.id}%20confirm%20karna%20chahte%20hain." target="_blank" class="btn-whatsapp btn-sm">💬 WhatsApp</a>
      </td>
    </tr>
  `).join("");
}

function renderAllOrders(list) {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding:40px;color:#94a3b8;">Abhi koi order record mein nahi hai</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o => {
    const itemsList = o.items ? o.items.map(i => `${i.name} (x${i.qty})`).join(", ") : "—";
    const date = new Date(o.created_at).toLocaleDateString('ur-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });

    return `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td><strong>${o.customer_name}</strong></td>
        <td><a href="tel:${o.customer_phone}" style="color:#2563eb;text-decoration:none;font-weight:600;">${o.customer_phone}</a></td>
        <td><small>${o.customer_address || "Alipur Chatha"}</small></td>
        <td><small style="color:#475569;">${itemsList}</small></td>
        <td><strong style="color:#1e40af;">Rs. ${Number(o.total_amount).toLocaleString()}</strong></td>
        <td><small style="color:#94a3b8;">${date}</small></td>
        <td>
          <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-weight:600;font-size:0.8rem;">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <a href="https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum!%20Singer%20Digital%20se%20aapka%20order%20#${o.id}%20confirm%20karna%20chahte%20hain." target="_blank" class="btn-whatsapp btn-sm">💬 WhatsApp</a>
            <button class="btn-danger btn-sm" onclick="deleteOrder(${o.id})" title="Delete Order">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function updateOrderStatus(id, newStatus) {
  try {
    const res = await authFetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order #${id} status: ${newStatus}`, "success");
      loadOrders();
      loadStats();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteOrder(id) {
  if (!confirm(`Order #${id} delete karein?`)) return;
  try {
    const res = await authFetch(`/api/orders/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Order delete ho gaya!", "success");
      loadOrders();
      loadStats();
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 4. INQUIRIES MANAGEMENT
// ==========================================
async function loadInquiries() {
  try {
    const res = await authFetch("/api/inquiries");
    const data = await res.json();
    if (data.success) {
      allInquiries = data.inquiries;
      renderInquiries(allInquiries);
    }
  } catch (err) {
    console.error("Error loading inquiries:", err);
  }
}

function renderInquiries(list) {
  const tbody = document.getElementById("inquiriesTableBody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:40px;color:#94a3b8;">Koi naya message nahi mila</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(m => {
    const date = new Date(m.created_at).toLocaleDateString('ur-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
    return `
      <tr>
        <td>#${m.id}</td>
        <td><strong>${m.name}</strong></td>
        <td><a href="tel:${m.phone}" style="color:#2563eb;text-decoration:none;font-weight:600;">${m.phone}</a></td>
        <td><span class="status-badge Confirmed">${m.subject || "General"}</span></td>
        <td><p style="max-width:320px;font-size:0.85rem;color:#334155;">${m.message}</p></td>
        <td><small style="color:#94a3b8;">${date}</small></td>
        <td>
          <div style="display:flex;gap:6px;">
            <a href="https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum%20${encodeURIComponent(m.name)}!%20Singer%20Digital%20se%20aapke%20sawal%20ke%20jawab%20mein%20rabta%20kar%20rahe%20hain." target="_blank" class="btn-whatsapp btn-sm">💬 Reply</a>
            <button class="btn-danger btn-sm" onclick="deleteInquiry(${m.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function deleteInquiry(id) {
  if (!confirm("Message delete karein?")) return;
  try {
    const res = await authFetch(`/api/inquiries/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Message delete ho gaya!", "success");
      loadInquiries();
      loadStats();
    }
  } catch (err) {
    console.error(err);
  }
}

// Toast
function showToast(message, type = "success") {
  const container = document.getElementById("adminToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✅" : "⚠️"}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
