// ==========================================
// Singer Digital National Electronics - Script
// ==========================================

const SHOP_PHONE = "923032997825";
const SHOP_PHONE_2 = "923026674808";

// Products Data Catalog (Dynamic from backend with offline fallback)
let products = [
  {
    id: 1,
    name: "Philips Air Fryer Digital 12.5 Litres HD9788 Dual Elements",
    category: "Air Fryer",
    brand: "Philips",
    price: 29950,
    oldPrice: 36000,
    rating: 5,
    reviews: 48,
    badge: "hot",
    badgeText: "Special Deal",
    image: "images/philips_airfryer_hd9788_clean.png"
  },
  {
    id: 2,
    name: "Philips Avance Collection Food Processor HR7776/91 1300W",
    category: "Food Processor",
    brand: "Philips",
    price: 38500,
    oldPrice: 44000,
    rating: 5,
    reviews: 32,
    badge: "sale",
    badgeText: "1300W 3-in-1",
    image: "images/philips_food_processor_hr7776_clean.png"
  },
  {
    id: 3,
    name: "Electric Kaital / Stainless Steel Cordless Kettle 2.0L",
    category: "Electric Kaital",
    brand: "Philips",
    price: 3500,
    oldPrice: 4500,
    rating: 4.9,
    reviews: 55,
    badge: "hot",
    badgeText: "Best Seller",
    image: "images/electric_kettle.jpg"
  },
  {
    id: 4,
    name: "TCL 55\" 4K UHD Smart Google Android LED TV",
    category: "LED",
    brand: "TCL",
    price: 98000,
    oldPrice: 115000,
    rating: 5,
    reviews: 44,
    badge: "sale",
    badgeText: "4K HDR",
    image: "images/tcl_smart_led.jpg"
  },
  {
    id: 5,
    name: "Gree 1.5 Ton Fairy Inverter AC (Heat & Cool) Energy Saver",
    category: "AC",
    brand: "Gree",
    price: 158000,
    oldPrice: 178000,
    rating: 5,
    reviews: 63,
    badge: "hot",
    badgeText: "T3 Inverter",
    image: "images/gree_inverter_ac.jpg"
  },
  {
    id: 6,
    name: "Haier 1.5 Ton Thunder Inverter AC DC Inverter T3",
    category: "AC",
    brand: "Haier",
    price: 142000,
    oldPrice: 160000,
    rating: 4.9,
    reviews: 38,
    badge: "sale",
    badgeText: "Top Inverter",
    image: "images/dawlance_inverter_ac_2ton.jpg"
  },
  {
    id: 7,
    name: "Orient 43\" Smart Frameless Android LED TV",
    category: "LED",
    brand: "Orient",
    price: 68000,
    oldPrice: 78000,
    rating: 4.8,
    reviews: 29,
    badge: "sale",
    badgeText: "Frameless",
    image: "images/tcl_smart_led.jpg"
  },
  {
    id: 8,
    name: "Multinet 40\" Smart Android HD LED TV",
    category: "LED",
    brand: "Multinet",
    price: 54000,
    oldPrice: 62000,
    rating: 4.7,
    reviews: 22,
    badge: "",
    badgeText: "",
    image: "images/media_1789642507725.png"
  },
  {
    id: 9,
    name: "Dawlance Inverter Refrigerator 91996 Chrome Line",
    category: "Fridges",
    brand: "Dawlance",
    price: 128999,
    oldPrice: 142000,
    rating: 5,
    reviews: 58,
    badge: "sale",
    badgeText: "10% OFF",
    image: "images/media_1789641946550.png"
  },
  {
    id: 10,
    name: "Dawlance Fully Automatic Washing Machine 10Kg",
    category: "Washing Machines",
    brand: "Dawlance",
    price: 65000,
    oldPrice: 76500,
    rating: 5,
    reviews: 41,
    badge: "hot",
    badgeText: "Automatic",
    image: "images/media_1789642116638.png"
  },
  {
    id: 11,
    name: "Super Asia Double Tub Semi-Automatic Washing Machine SA-280",
    category: "Washing Machines",
    brand: "Super Asia",
    price: 48000,
    oldPrice: 54000,
    rating: 4.8,
    reviews: 35,
    badge: "hot",
    badgeText: "Double Tub",
    image: "images/super_asia_sa280.png?v=2"
  },
  {
    id: 12,
    name: "Dawlance Deep Freezer Double Door Heavy Duty",
    category: "Deep Freezers",
    brand: "Dawlance",
    price: 108000,
    oldPrice: 118000,
    rating: 4.8,
    reviews: 27,
    badge: "sale",
    badgeText: "Best Seller",
    image: "images/media_1789642419108.png"
  },
  {
    id: 13,
    name: "Dawlance Digital Microwave Oven with Grill",
    category: "Microwave",
    brand: "Dawlance",
    price: 24500,
    oldPrice: 28000,
    rating: 4.7,
    reviews: 19,
    badge: "",
    badgeText: "",
    image: "images/media_1789642762026.png"
  },
  {
    id: 14,
    name: "Samsung Galaxy Smartphone Official PTA Approved",
    category: "Mobile Phones",
    brand: "Samsung",
    price: 132000,
    oldPrice: 145000,
    rating: 4.9,
    reviews: 73,
    badge: "hot",
    badgeText: "Official PTA",
    image: "images/samsung_galaxy_phone.jpg"
  },
  {
    id: 15,
    name: "Apple iPhone 15 Pro Max 256GB Dual SIM / e-SIM",
    category: "Mobile Phones",
    brand: "Apple",
    price: 435000,
    oldPrice: 460000,
    rating: 5,
    reviews: 89,
    badge: "hot",
    badgeText: "Apple Official",
    image: "images/iphone_15.jpg"
  },
  {
    id: 16,
    name: "Honda CD 70cc 2026 Model Euro II Genuine",
    category: "Motor Bike",
    brand: "Honda",
    price: 159900,
    oldPrice: 165000,
    rating: 5,
    reviews: 112,
    badge: "hot",
    badgeText: "Cash / Qist",
    image: "images/honda_cd70.jpg"
  },
  {
    id: 17,
    name: "Electric Scooty / Bike High Speed Lithium Battery",
    category: "Motor Bike",
    brand: "Electric",
    price: 177000,
    oldPrice: 195000,
    rating: 4.8,
    reviews: 31,
    badge: "sale",
    badgeText: "Eco Saver",
    image: "images/media_1789643291879.png"
  },
  {
    id: 18,
    name: "Dawlance Heavy Dry Iron / Istari 1000W",
    category: "Iron",
    brand: "Dawlance",
    price: 10500,
    oldPrice: 12000,
    rating: 4.9,
    reviews: 46,
    badge: "",
    badgeText: "",
    image: "images/dawlance_heavy_dry_iron.jpg"
  },
  {
    id: 19,
    name: "National 3-in-1 Juicer Blender Grinder Machine",
    category: "Food Processor",
    brand: "National",
    price: 11500,
    oldPrice: 13500,
    rating: 4.7,
    reviews: 38,
    badge: "sale",
    badgeText: "National Original",
    image: "images/media_1789643007198.png"
  },
  {
    id: 20,
    name: "Dawlance Air Fryer Healthy Cooking",
    category: "Air Fryer",
    brand: "Dawlance",
    price: 20500,
    oldPrice: 24000,
    rating: 4.8,
    reviews: 25,
    badge: "hot",
    badgeText: "Special",
    image: "images/media_1789642919620.png"
  },
  {
    id: 21,
    name: "Vivo Y27s / Y28 4G Official PTA Approved",
    category: "Mobile Phones",
    brand: "Vivo",
    price: 46999,
    oldPrice: 52000,
    rating: 4.9,
    reviews: 47,
    badge: "hot",
    badgeText: "Official PTA",
    image: "images/vivo_smartphone.png?v=1"
  }
];

// State
let cart = JSON.parse(localStorage.getItem("singer_cart") || "[]");
let currentCategory = "All";
let searchQuery = "";
const wishlist = new Set(JSON.parse(localStorage.getItem("singer_wishlist") || "[]"));

// ==========================================
// Initialization
// ==========================================
async function init() {
  renderProducts();
  updateCartBadge();
  setupEventListeners();
  initIntersectionObserver();
  initCountdown();
  await fetchProductsFromBackend();
}

async function fetchProductsFromBackend() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      products = data.products;
      renderProducts();
    }
  } catch (err) {
    console.warn("Backend products fetch fallback active:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ==========================================
// Render Products Grid
// ==========================================
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const filtered = products.filter(item => {
    let matchCategory = false;
    if (currentCategory === "All") {
      matchCategory = true;
    } else {
      const c = currentCategory.toLowerCase();
      const pCat = item.category.toLowerCase();
      matchCategory = pCat === c || pCat.includes(c) || c.includes(pCat);
    }

    const matchSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-size: 1.2rem; color: var(--text); margin-bottom: 8px;">Koi product nahi mila</h3>
        <p>Mukhtalif lafz likh kar ya category tabdeel kar ke doobara check karein.</p>
        <button onclick="filterProducts('All')" class="btn-primary" style="margin-top: 16px; padding: 10px 20px;">Tamam Products Dekhein</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prod => {
    const isWish = wishlist.has(prod.id);
    const badgeHtml = prod.badgeText 
      ? `<span class="product-badge ${prod.badge}">${prod.badgeText}</span>` 
      : "";

    return `
      <div class="product-card" data-id="${prod.id}">
        <div class="product-img-wrap">
          ${badgeHtml}
          <button class="product-wishlist ${isWish ? "active" : ""}" onclick="toggleWishlist(${prod.id}, this)" title="Wishlist">
            ${isWish ? "❤️" : "🤍"}
          </button>
          <img src="${prod.image}" alt="${prod.name}" loading="lazy" />
        </div>
        <div class="product-info">
          <div class="product-cat">${prod.category} • ${prod.brand}</div>
          <h3 class="product-name">${prod.name}</h3>
          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-count">(${prod.reviews} reviews)</span>
          </div>
          <div class="product-footer">
            <div class="product-price">
              <span class="price-current">Rs. ${prod.price.toLocaleString()}</span>
              ${prod.oldPrice ? `<span class="price-old">Rs. ${prod.oldPrice.toLocaleString()}</span>` : ""}
            </div>
            <button class="btn-add-cart" onclick="addToCartById(${prod.id})">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================
// Filter and Search
// ==========================================
function filterProducts(cat) {
  currentCategory = cat;

  // Update active button state in products filter
  document.querySelectorAll(".filter-btn").forEach(btn => {
    const text = btn.innerText.toLowerCase();
    const target = cat.toLowerCase();
    if (cat === "All" && text.includes("all")) {
      btn.classList.add("active");
    } else if (cat !== "All" && (text.includes(target) || target.includes(text.replace(/[^a-z]/g, "")))) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderProducts();

  const productsSec = document.getElementById("products");
  if (productsSec) {
    const rect = productsSec.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight) {
      productsSec.scrollIntoView({ behavior: "smooth" });
    }
  }
}

function filterByBrand(brand) {
  currentCategory = "All";
  searchQuery = brand;
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = brand;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    if (btn.innerText.toLowerCase().includes("all")) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderProducts();
  scrollToProducts();
  showToast(`${brand} ke products show ho rahe hain!`, "success");
}

function scrollToProducts() {
  const sec = document.getElementById("products");
  if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// Cart Management
// ==========================================
function addToCartById(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      qty: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`"${prod.name}" cart mein shamil ho gaya!`, "success");
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  if (badge) {
    badge.innerText = count;
  }
}

function openCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (sidebar) sidebar.classList.add("open");
  if (overlay) overlay.classList.add("active");
  renderCartItems();
}

function closeCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
}

function renderCartItems() {
  const itemsContainer = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");
  const totalAmount = document.getElementById("cartTotal");

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Aapka cart abhi khali hai</p>
      </div>
    `;
    if (footer) footer.style.display = "none";
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove item">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (footer) {
    footer.style.display = "block";
    footer.innerHTML = `
      <div class="cart-total">
        <span>Kul Raqam</span>
        <span class="cart-total-amount" id="cartTotal">Rs. ${total.toLocaleString()}</span>
      </div>
      <button class="btn-checkout" onclick="checkout('primary')">
        💬 Order via WhatsApp (0303-2997825)
      </button>
      <button class="btn-whatsapp" onclick="checkout('secondary')" style="background:#128c7e;margin-top:6px;">
        💬 Order via WhatsApp (0302-6674808)
      </button>
    `;
  }
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast("Item cart se nikal diya gaya", "error");
}

function saveCart() {
  localStorage.setItem("singer_cart", JSON.stringify(cart));
}

// Order via WhatsApp
function orderWhatsApp(target = "primary") {
  if (cart.length === 0) {
    showToast("Aapka cart khali hai!", "error");
    return;
  }

  const phone = target === "secondary" ? SHOP_PHONE_2 : SHOP_PHONE;

  let text = "السلام علیکم Singer Digital National Electronics!\nMain yeh products order karna chahta hoon:\n\n";
  let total = 0;
  cart.forEach((item, index) => {
    const sum = item.price * item.qty;
    total += sum;
    text += `${index + 1}. ${item.name}\n   Tadad: ${item.qty} x Rs. ${item.price.toLocaleString()} = Rs. ${sum.toLocaleString()}\n`;
  });
  text += `\n*Kul Raqam: Rs. ${total.toLocaleString()}*\n\nBaraye meharbani confirmation aur delivery ki maloomat dein. Shukriya!`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function checkout(target = "primary") {
  openCheckoutModal(target);
}

// Customer Checkout Modal Logic
let currentCheckoutTarget = "primary";

function openCheckoutModal(target = "primary") {
  if (cart.length === 0) {
    showToast("Aapka cart khali hai!", "error");
    return;
  }
  currentCheckoutTarget = target;

  const overlay = document.getElementById("checkoutModalOverlay");
  const summaryEl = document.getElementById("checkoutSummary");
  if (!overlay || !summaryEl) return;

  let total = 0;
  let itemsHtml = cart.map(i => {
    const sum = i.price * i.qty;
    total += sum;
    return `
      <div class="checkout-summary-row">
        <span>${i.name} × ${i.qty}</span>
        <strong>Rs. ${sum.toLocaleString()}</strong>
      </div>
    `;
  }).join("");

  itemsHtml += `
    <div class="checkout-summary-row total">
      <span>Total Raqam (Cash on Delivery):</span>
      <span>Rs. ${total.toLocaleString()}</span>
    </div>
  `;

  summaryEl.innerHTML = itemsHtml;
  overlay.style.display = "flex";
  closeCart();
}

function closeCheckoutModal() {
  const overlay = document.getElementById("checkoutModalOverlay");
  if (overlay) overlay.style.display = "none";
}

function handleCheckoutOverlayClick(e) {
  if (e.target.id === "checkoutModalOverlay") {
    closeCheckoutModal();
  }
}

async function submitCustomerOrder(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showToast("Cart khali hai!", "error");
    return;
  }

  const name = document.getElementById("custName")?.value.trim();
  const phone = document.getElementById("custPhone")?.value.trim();
  const address = document.getElementById("custAddress")?.value.trim();
  const btn = document.getElementById("confirmOrderBtn");

  if (!name || !phone || !address) {
    showToast("Baraye meharbani sari details enter karein", "error");
    return;
  }

  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const itemsSnapshot = [...cart];

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Order Book Ho Raha Hai...";
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: itemsSnapshot,
        totalAmount: totalAmount
      })
    });
    const data = await res.json();

    const orderId = data.success ? data.orderId : "NEW";

    // Build WhatsApp message including Order ID
    const targetPhone = currentCheckoutTarget === "secondary" ? SHOP_PHONE_2 : SHOP_PHONE;
    let text = `السلام علیکم Singer Digital!\nNaya Order Book Hua Hai (Order #${orderId}):\n`;
    text += `👤 Customer: ${name}\n📞 Phone: ${phone}\n📍 Pata: ${address}\n\n*Items:*\n`;
    itemsSnapshot.forEach((i, idx) => {
      text += `${idx + 1}. ${i.name} (Qty: ${i.qty}) = Rs. ${(i.price * i.qty).toLocaleString()}\n`;
    });
    text += `\n💰 *Kul Raqam: Rs. ${totalAmount.toLocaleString()}* (Cash on Delivery)\nBaraye meharbani dispatch confirm karein.`;

    // Clear cart and UI
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartItems();
    closeCheckoutModal();

    showToast(`Mubarak! Order #${orderId} kamyabi se book ho gaya!`, "success");

    // Open WhatsApp
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");

  } catch (err) {
    console.error("Order submission error:", err);
    showToast("Server error, WhatsApp ke zariye order bheja ja raha hai", "error");
    orderWhatsApp(currentCheckoutTarget);
    closeCheckoutModal();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "✅ Order Book Karein";
    }
  }
}

// ==========================================
// Wishlist
// ==========================================
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.classList.remove("active");
    btn.innerText = "🤍";
    showToast("Wishlist se hata diya", "error");
  } else {
    wishlist.add(id);
    btn.classList.add("active");
    btn.innerText = "❤️";
    showToast("Wishlist mein shamil ho gaya!", "success");
  }
  localStorage.setItem("singer_wishlist", JSON.stringify(Array.from(wishlist)));
}

// ==========================================
// Countdown Timer for Deals
// ==========================================
function initCountdown() {
  let hours = 8;
  let mins = 45;
  let secs = 30;

  const hEl = document.getElementById("countHours");
  const mEl = document.getElementById("countMins");
  const sEl = document.getElementById("countSecs");

  if (!hEl || !mEl || !sEl) return;

  setInterval(() => {
    if (secs > 0) {
      secs--;
    } else {
      secs = 59;
      if (mins > 0) {
        mins--;
      } else {
        mins = 59;
        if (hours > 0) hours--;
      }
    }

    hEl.innerText = String(hours).padStart(2, "0");
    mEl.innerText = String(mins).padStart(2, "0");
    sEl.innerText = String(secs).padStart(2, "0");
  }, 1000);
}

// ==========================================
// Intersection Observer (Fade-In Animation)
// ==========================================
function initIntersectionObserver() {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach(el => el.classList.add("visible"));
}

// ==========================================
// Contact Form Submit
// ==========================================
async function submitForm(e) {
  e.preventDefault();
  const fname = document.getElementById("fname")?.value.trim() || "";
  const lname = document.getElementById("lname")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const subject = document.getElementById("subject")?.value.trim() || "General Inquiry";
  const msg = document.getElementById("message")?.value.trim() || "";

  const fullName = `${fname} ${lname}`.trim() || "Customer";

  // 1. Save to backend SQLite Database
  try {
    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        phone: phone,
        subject: subject,
        message: msg
      })
    }).catch(err => console.warn("Inquiry DB save fallback:", err));
  } catch (err) {}

  // 2. Open WhatsApp for instant messaging
  const whatsappMsg = `السلام علیکم!
Mera naam: ${fullName}
Phone: ${phone}
Mauzu: ${subject}
Message: ${msg}`;

  const url = `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(whatsappMsg)}`;
  window.open(url, "_blank");

  showToast("Aapka paigham book ho gaya hai aur WhatsApp open ho raha hai!", "success");
  e.target.reset();
}

// ==========================================
// Toast Notification
// ==========================================
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "success" ? "✅" : "ℹ️"}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ==========================================
// Event Listeners (Search, Menu, Scroll)
// ==========================================
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
  }

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    });
  }

  const scrollTopBtn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }
  });
}
