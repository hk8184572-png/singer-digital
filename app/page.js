"use client";

import { useState, useEffect } from 'react';

const SHOP_PHONE = "923032997825";
const SHOP_PHONE_2 = "923026674808";

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [currentCategory, setCurrentCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form states
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Contact Form state
  const [contactFname, setContactFname] = useState("");
  const [contactLname, setContactLname] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 8, mins: 45, secs: 30 });
  const [toasts, setToasts] = useState([]);

  // Load Initial Data
  useEffect(() => {
    // Load local cart
    try {
      const savedCart = localStorage.getItem("singer_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWish = localStorage.getItem("singer_wishlist");
      if (savedWish) setWishlist(new Set(JSON.parse(savedWish)));
    } catch (e) {}

    // Fetch Products from API
    fetchProducts();

    // Timer Interval
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, mins, secs } = prev;
        if (secs > 0) secs--;
        else {
          secs = 59;
          if (mins > 0) mins--;
          else {
            mins = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, mins, secs };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save Cart to LocalStorage
  const saveCartState = (newCart) => {
    setCart(newCart);
    localStorage.setItem("singer_cart", JSON.stringify(newCart));
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Add To Cart
  const addToCartById = (id) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === id);
      let updated;
      if (existingIndex > -1) {
        updated = [...prevCart];
        updated[existingIndex].qty += 1;
      } else {
        updated = [...prevCart, { id: prod.id, name: prod.name, price: prod.price, image: prod.image, qty: 1 }];
      }
      localStorage.setItem("singer_cart", JSON.stringify(updated));
      return updated;
    });

    showToast(`"${prod.name}" cart mein shamil ho gaya!`, "success");
  };

  // Update Qty
  const updateQty = (id, delta) => {
    setCart(prevCart => {
      const updated = prevCart.map(item => {
        if (item.id === id) return { ...item, qty: item.qty + delta };
        return item;
      }).filter(item => item.qty > 0);

      localStorage.setItem("singer_cart", JSON.stringify(updated));
      return updated;
    });
  };

  // Remove Item
  const removeFromCart = (id) => {
    setCart(prevCart => {
      const updated = prevCart.filter(item => item.id !== id);
      localStorage.setItem("singer_cart", JSON.stringify(updated));
      return updated;
    });
    showToast("Item cart se nikal diya gaya", "error");
  };

  // Toggle Wishlist
  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
        showToast("Wishlist se hata diya", "error");
      } else {
        updated.add(id);
        showToast("Wishlist mein shamil ho gaya!", "success");
      }
      localStorage.setItem("singer_wishlist", JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  // Category & Brand Filter
  const filterProducts = (cat) => {
    setCurrentCategory(cat);
    scrollToProducts();
  };

  const filterByBrand = (brand) => {
    setCurrentCategory("All");
    setSearchQuery(brand);
    scrollToProducts();
    showToast(`${brand} ke products show ho rahe hain!`, "success");
  };

  const scrollToProducts = () => {
    const sec = document.getElementById("products");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate Cart Total
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Submit Order Logic
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Cart khali hai!", "error");
      return;
    }
    if (!custName || !custPhone || !custAddress) {
      showToast("Sari details darj karein", "error");
      return;
    }

    setIsSubmittingOrder(true);
    const itemsSnapshot = [...cart];

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          customerAddress: custAddress,
          items: itemsSnapshot,
          totalAmount: cartTotal
        })
      });
      const data = await res.json();
      const orderId = data.success ? data.orderId : "NEW";

      // Build WhatsApp Message
      let text = `السلام علیکم Singer Digital!\nNaya Order Book Hua Hai (Order #${orderId}):\n`;
      text += `👤 Customer: ${custName}\n📞 Phone: ${custPhone}\n📍 Pata: ${custAddress}\n\n*Items:*\n`;
      itemsSnapshot.forEach((i, idx) => {
        text += `${idx + 1}. ${i.name} (Qty: ${i.qty}) = Rs. ${(i.price * i.qty).toLocaleString()}\n`;
      });
      text += `\n💰 *Kul Raqam: Rs. ${cartTotal.toLocaleString()}* (Cash on Delivery)\nBaraye meharbani dispatch confirm karein.`;

      // Reset cart and modal
      saveCartState([]);
      setIsCheckoutOpen(false);
      setCustName("");
      setCustPhone("");
      setCustAddress("");

      showToast(`Mubarak! Order #${orderId} kamyabi se book ho gaya!`, "success");

      // Open WhatsApp
      const waUrl = `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");

    } catch (err) {
      console.error(err);
      showToast("Order save hone mein masla hua, Direct WhatsApp par order bheja ja raha hai", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${contactFname} ${contactLname}`.trim() || "Customer";
    if (!contactPhone || !contactMsg) {
      showToast("Phone aur message zaroori hain", "error");
      return;
    }

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone: contactPhone,
          subject: contactSubject || "General Inquiry",
          message: contactMsg
        })
      });
    } catch (e) {}

    const waText = `السلام علیکم!\nMera naam: ${fullName}\nPhone: ${contactPhone}\nMauzu: ${contactSubject || "General"}\nMessage: ${contactMsg}`;
    window.open(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(waText)}`, "_blank");

    showToast("Aapka message receive ho gaya hai aur WhatsApp open ho raha hai!", "success");
    setContactFname("");
    setContactLname("");
    setContactPhone("");
    setContactSubject("");
    setContactMsg("");
  };

  // Filtered Products List
  const filteredProducts = products.filter(item => {
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

  return (
    <>
      {/* Top Announcement */}
      <div className="top-announcement-bar">
        🎁 🎉 <strong>دکان پر آنے والے کسٹمرز کے لیے خصوصی ڈسکاؤنٹ!</strong> &nbsp;|&nbsp; 📞 <strong>0303-2997825</strong> &nbsp;•&nbsp; <strong>0302-6674808</strong> (Alipur Chatha) 🎉 🎁
      </div>

      {/* Navbar */}
      <nav className="navbar" id="navbar">
        <div className="nav-logo">
          <div className="logo-icon">🏪</div>
          <span>Singer<span> Digital</span></span>
        </div>

        <ul className="nav-links">
          <li><a href="#home" className="active">Home</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#brands">Brands</a></li>
          <li><a href="#deals">Deals</a></li>
          <li><a href="#contact">Contact</a></li>
          <li>
            <a href="/admin" target="_blank" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
              ⚙️ Admin
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <div className="nav-search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Product dhundein..."
            />
          </div>
          <button className="btn-cart" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            🛒 Cart
            <span className="cart-badge">{cartCount}</span>
          </button>
          <button className="nav-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>🏠 Home</a>
        <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>ℹ️ About Us</a>
        <a href="#categories" onClick={() => setIsMobileMenuOpen(false)}>📦 Categories</a>
        <a href="#products" onClick={() => setIsMobileMenuOpen(false)}>🛍️ Products</a>
        <a href="#brands" onClick={() => setIsMobileMenuOpen(false)}>🏭 Brands</a>
        <a href="#deals" onClick={() => setIsMobileMenuOpen(false)}>🔥 Deals</a>
        <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>📞 Contact</a>
        <a href="/admin" target="_blank" style={{ color: '#2563eb', fontWeight: 700 }}>⚙️ Admin Control Panel</a>
      </div>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text fade-in visible">
            <div className="hero-badge">🇵🇰 Alipur Chatha, Gujranwala Road</div>
            <h1 className="hero-title">
              Singer Digital<br /><span className="highlight">National Electronics</span>
            </h1>
            <p className="hero-desc">
              Alipur Chatha ki number one electronics dukan. Fridge, AC, Washing Machine, LED, Mobile Phones, Motor Bike aur bahut kuch — sab ek jagah!
            </p>
            <div className="hero-buttons">
              <a href="#products" className="btn-primary">🛍️ Products Dekhein</a>
              <a href="#contact" className="btn-outline">📞 Rabta Karein</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">10+</div>
                <div className="stat-label">Top Brands</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">100%</div>
                <div className="stat-label">Authentic</div>
              </div>
            </div>
          </div>

          <div className="hero-visual fade-in visible">
            <div className="hero-prod-card" onClick={scrollToProducts}>
              <img className="hero-prod-img" src="images/media_1789641946550.png" alt="Fridges" />
              <div className="hero-prod-name">Fridges</div>
              <div className="hero-prod-price">From Rs. 128,999</div>
            </div>
            <div className="hero-prod-card" onClick={scrollToProducts}>
              <img className="hero-prod-img" src="images/media_1789642259960.png" alt="Air Conditioners" />
              <div className="hero-prod-name">Air Conditioners</div>
              <div className="hero-prod-price">From Rs. 145,000</div>
            </div>
            <div className="hero-prod-card" onClick={scrollToProducts}>
              <img className="hero-prod-img" src="images/media_1789642507725.png" alt="LED TVs" />
              <div className="hero-prod-name">LED TVs</div>
              <div className="hero-prod-price">From Rs. 115,000</div>
            </div>
            <div className="hero-prod-card" onClick={scrollToProducts}>
              <img className="hero-prod-img" src="images/media_1789642116638.png" alt="Washing Machines" />
              <div className="hero-prod-name">Washing Machines</div>
              <div className="hero-prod-price">From Rs. 65,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-grid fade-in visible">
            <div className="about-img-col">
              <div className="about-img-wrap">
                <img src="images/shop_front.jpg" alt="Singer Digital Shop Front" />
                <div className="about-badge-float">
                  <div className="about-badge-icon">📅</div>
                  <div>
                    <div className="about-badge-title">Hamari Dukan</div>
                    <div className="about-badge-sub">6 September 2026</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-content">
              <div className="section-tag">Hamaray Baray Mein</div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>Kaun Hain <span>Hum?</span></h2>
              <p className="about-desc">
                <strong>Singer Digital National Electronics</strong> Alipur Chatha ki ek nayi lekin bharosa mand electronics dukan hai. Hamari dukan <strong>6 September 2026</strong> ko Gujranwala Road par, Bank of Punjab ke saamne khuli.
              </p>
              <p className="about-desc">
                Ham aapko asli aur guaranteed electronics products faraham kartay hain — chahe fridge ho, AC ho, washing machine ho, LED TV ho, ya mobile phone. Har product top brands ka hai aur har cheez best price mein milti hai.
              </p>
              <div className="about-features">
                <div className="about-feat-item"><span>✅</span><span>100% Asli Maal – Guarantee ke saath</span></div>
                <div className="about-feat-item"><span>💰</span><span>Best Prices in Alipur Chatha</span></div>
                <div className="about-feat-item"><span>🔧</span><span>After-Sale Service Available</span></div>
                <div className="about-feat-item"><span>📦</span><span>Installment par bhi milega</span></div>
              </div>
              <a href="#contact" className="btn-primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
                📞 Aaj Hi Rabta Karein
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories" id="categories">
        <div className="container">
          <div className="section-header fade-in visible">
            <div className="section-tag">Browse By</div>
            <h2 className="section-title">Category <span>Chunein</span></h2>
            <p className="section-desc">Hamare paas har qisam ki electronics milti hai</p>
          </div>
          <div className="categories-grid fade-in visible">
            <div className="cat-card" onClick={() => filterProducts('Fridges')}>
              <img src="images/media_1789641946550.png" alt="Fridges" className="cat-img" />
              <div className="cat-name">Fridges</div>
              <div className="cat-count">Dawlance & National</div>
              <div className="cat-price">From Rs. 128,999</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Washing Machines')}>
              <img src="images/media_1789642116638.png" alt="Washing Machines" className="cat-img" />
              <div className="cat-name">Washing Machines</div>
              <div className="cat-count">National & Super Asia</div>
              <div className="cat-price">From Rs. 65,000</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('AC')}>
              <img src="images/gree_inverter_ac.jpg" alt="Air Conditioners" className="cat-img" />
              <div className="cat-name">Air Conditioners</div>
              <div className="cat-count">Gree, Haier & Dawlance</div>
              <div className="cat-price">From Rs. 142,000</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('LED')}>
              <img src="images/tcl_smart_led.jpg" alt="LED TVs" className="cat-img" />
              <div className="cat-name">LED TVs</div>
              <div className="cat-count">TCL, Multinet, Orient & Haier</div>
              <div className="cat-price">From Rs. 54,000</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Air Fryer')}>
              <img src="images/philips_airfryer_hd9788_clean.png" alt="Air Fryer" className="cat-img" />
              <div className="cat-name">Air Fryer</div>
              <div className="cat-count">Philips & Dawlance</div>
              <div className="cat-price">From Rs. 20,500</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Electric Kaital')}>
              <img src="images/electric_kettle.jpg" alt="Electric Kaital" className="cat-img" />
              <div className="cat-name">Electric Kaital</div>
              <div className="cat-count">Cordless Kettles 2.0L</div>
              <div className="cat-price">From Rs. 3,500</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Food Processor')}>
              <img src="images/philips_food_processor_hr7776_clean.png" alt="Food Processor" className="cat-img" />
              <div className="cat-name">Food Processor</div>
              <div className="cat-count">Philips & National 3-in-1</div>
              <div className="cat-price">From Rs. 38,500</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Mobile Phones')}>
              <img src="images/vivo_smartphone.png" alt="Mobile Phones" className="cat-img" />
              <div className="cat-name">Mobile Phones</div>
              <div className="cat-count">Vivo, Samsung, iPhone</div>
              <div className="cat-price">From Rs. 46,999</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Microwave')}>
              <img src="images/media_1789642762026.png" alt="Microwave" className="cat-img" />
              <div className="cat-name">Microwave</div>
              <div className="cat-count">Dawlance & Haier</div>
              <div className="cat-price">From Rs. 20,000</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Motor Bike')}>
              <img src="images/honda_cd70.jpg" alt="Motor Bikes" className="cat-img" />
              <div className="cat-name">Motor Bikes</div>
              <div className="cat-count">Honda & Electric Bikes</div>
              <div className="cat-price">From Rs. 159,900</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Deep Freezers')}>
              <img src="images/media_1789642419108.png" alt="Deep Freezers" className="cat-img" />
              <div className="cat-name">Deep Freezers</div>
              <div className="cat-count">Dawlance & Haier</div>
              <div className="cat-price">From Rs. 108,000</div>
            </div>
            <div className="cat-card" onClick={() => filterProducts('Iron')}>
              <img src="images/dawlance_heavy_dry_iron.jpg" alt="Irons" className="cat-img" />
              <div className="cat-name">Irons</div>
              <div className="cat-count">National & Dawlance</div>
              <div className="cat-price">From Rs. 10,500</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products" id="products">
        <div className="container">
          <div className="products-announcement-box fade-in visible">
            🎁 🎉 <strong>دکان پر آنے والے کسٹمرز کے لیے خصوصی ڈسکاؤنٹ!</strong> (Special Discount for In-Store Customers) 🎉 🎁
          </div>

          <div className="section-header fade-in visible">
            <div className="section-tag">Hamara Maal</div>
            <h2 className="section-title">Featured <span>Products</span></h2>
            <p className="section-desc">Behtareen products, best prices ke saath — sirf Singer Digital par</p>
          </div>

          <div className="products-filter fade-in visible">
            {['All', 'Fridges', 'Washing Machines', 'AC', 'LED', 'Air Fryer', 'Electric Kaital', 'Food Processor', 'Mobile Phones', 'Motor Bike'].map(cat => (
              <button
                key={cat}
                className={`filter-btn ${currentCategory === cat ? 'active' : ''}`}
                onClick={() => filterProducts(cat)}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Koi product nahi mila</h3>
                <p>Mukhtalif lafz likh kar ya category tabdeel kar ke doobara check karein.</p>
                <button onClick={() => filterProducts('All')} className="btn-primary" style={{ marginTop: '16px', padding: '10px 20px' }}>
                  Tamam Products Dekhein
                </button>
              </div>
            ) : (
              filteredProducts.map(prod => {
                const isWish = wishlist.has(prod.id);
                return (
                  <div key={prod.id} className="product-card">
                    <div className="product-img-wrap">
                      {prod.badgeText && (
                        <span className={`product-badge ${prod.badge}`}>{prod.badgeText}</span>
                      )}
                      <button
                        className={`product-wishlist ${isWish ? 'active' : ''}`}
                        onClick={() => toggleWishlist(prod.id)}
                        title="Wishlist"
                      >
                        {isWish ? '❤️' : '🤍'}
                      </button>
                      <img src={prod.image} alt={prod.name} loading="lazy" onError={(e) => e.target.src = 'images/shop_front.jpg'} />
                    </div>
                    <div className="product-info">
                      <div className="product-cat">{prod.category} • {prod.brand}</div>
                      <h3 className="product-name">{prod.name}</h3>
                      <div className="product-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-count">({prod.reviews || 10} reviews)</span>
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          <span className="price-current">Rs. {Number(prod.price).toLocaleString()}</span>
                          {prod.oldPrice && <span className="price-old">Rs. {Number(prod.oldPrice).toLocaleString()}</span>}
                        </div>
                        <button className="btn-add-cart" onClick={() => addToCartById(prod.id)}>
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands-section" id="brands">
        <div className="container">
          <div className="section-header fade-in visible">
            <div className="section-tag">Hamare Brands</div>
            <h2 className="section-title">Top <span>Brands</span> jo Ham Bachtay Hain</h2>
            <p className="section-desc">Sirf original aur certified brands — koi duplicate nahi</p>
          </div>

          <div className="brand-pills-wrap fade-in visible">
            {['Dawlance', 'Philips', 'Haier', 'TCL', 'Gree', 'Orient', 'Multinet', 'National', 'Super Asia', 'Samsung', 'Vivo', 'Apple', 'Honda'].map(brand => (
              <span key={brand} className="brand-pill" onClick={() => filterByBrand(brand)}>
                🏭 {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Banner */}
      <section className="deals-banner" id="deals">
        <div className="deals-inner">
          <div className="fade-in visible">
            <div className="deals-tag">⚡ Mahdood Waqt</div>
            <h2 className="deals-title">Khaas Offers &<br /><span>Flash Sales</span></h2>
            <p className="deals-desc">Yeh offers sirf kuch ghantay ki hain. Jaldi karein aur apna pasanda product ly jain!</p>
            <div className="countdown">
              <div className="countdown-item">
                <span className="count-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="count-label">Ghantay</span>
              </div>
              <div className="countdown-item">
                <span className="count-value">{String(timeLeft.mins).padStart(2, '0')}</span>
                <span className="count-label">Minute</span>
              </div>
              <div className="countdown-item">
                <span className="count-value">{String(timeLeft.secs).padStart(2, '0')}</span>
                <span className="count-label">Second</span>
              </div>
            </div>
            <a href="#products" className="btn-primary">🔥 Offer Products Dekhein</a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="section-header fade-in visible">
            <div className="section-tag">Rabta Karein</div>
            <h2 className="section-title">Contact <span>Us</span></h2>
            <p className="section-desc">Koi bhi sawal ho — hum haazir hain!</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info fade-in visible">
              <div>
                <h3 className="contact-info-title">Dukan Par Aain Ya Call Karein</h3>
                <p>Hum Alipur Chatha mein aapki khidmat ke liye haazir hain. Dukan par aain ya WhatsApp karein.</p>
              </div>
              <div className="contact-item">
                <span className="contact-item-icon">📍</span>
                <div>
                  <h4>Hamaara Pata</h4>
                  <p>Gujranwala Road, Alipur Chatha<br />Opp. Bank of Punjab<br />District Hafizabad, Punjab, Pakistan</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-item-icon">📞</span>
                <div>
                  <h4>Phone / WhatsApp</h4>
                  <p>
                    <a href="tel:03032997825" style={{ color: 'inherit', fontWeight: 700 }}>0303-2997825</a> &nbsp;|&nbsp; 
                    <a href="tel:03026674808" style={{ color: 'inherit', fontWeight: 700 }}>0302-6674808</a>
                    <br />Dono numbers WhatsApp par 24/7 available hain
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${SHOP_PHONE}?text=Assalam%20o%20Alaikum!`} target="_blank" rel="noreferrer" className="whatsapp-direct-btn" style={{ flex: 1, minWidth: '180px' }}>
                  💬 0303-2997825
                </a>
                <a href={`https://wa.me/${SHOP_PHONE_2}?text=Assalam%20o%20Alaikum!`} target="_blank" rel="noreferrer" className="whatsapp-direct-btn" style={{ flex: 1, minWidth: '180px', background: '#128c7e' }}>
                  💬 0302-6674808
                </a>
              </div>
            </div>

            <div className="contact-form-wrap fade-in visible">
              <h3>📩 Message Bhejein</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pehla Naam</label>
                    <input type="text" value={contactFname} onChange={e => setContactFname(e.target.value)} placeholder="e.g. Hassan" required />
                  </div>
                  <div className="form-group">
                    <label>Aakhri Naam</label>
                    <input type="text" value={contactLname} onChange={e => setContactLname(e.target.value)} placeholder="e.g. Ali" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone / WhatsApp *</label>
                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="0300-0000000" required />
                  </div>
                  <div className="form-group">
                    <label>Sawal ka Mauzu</label>
                    <select value={contactSubject} onChange={e => setContactSubject(e.target.value)}>
                      <option value="">Topic chunein...</option>
                      <option value="price">Price Puchna</option>
                      <option value="product">Kisi Product ke baray mein</option>
                      <option value="installment">Installment Plan</option>
                      <option value="delivery">Home Delivery</option>
                      <option value="other">Kuch aur</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Apna Sawal / Message</label>
                  <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)} placeholder="Yahan apna sawal ya pegham likhein..." required></textarea>
                </div>
                <button type="submit" className="btn-submit">
                  <span>📨 Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2026 Singer Digital National Electronics – Alipur Chatha. All Rights Reserved.</p>
          <p>Made with ❤️ in Pakistan 🇵🇰 | 📞 0303-2997825 &nbsp;|&nbsp; 📞 0302-6674808 &nbsp;|&nbsp; <a href="/admin" target="_blank" style={{ color: '#38bdf8' }}>⚙️ Admin Panel</a></p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>🛒 Aapka Cart</h3>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <p>Cart abhi khali hai</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" onError={(e) => e.target.src = 'images/shop_front.jpg'} />
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">Rs. {Number(item.price).toLocaleString()}</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} title="Remove item">🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Kul Raqam</span>
              <span className="cart-total-amount">Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <button className="btn-checkout" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
              💳 Order Confirm Karein (Checkout)
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="checkout-modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.className.includes('overlay')) setIsCheckoutOpen(false); }}>
          <div className="checkout-modal-card">
            <div className="checkout-modal-header">
              <h3>📦 Delivery & Order Details</h3>
              <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            </div>

            <div className="checkout-order-summary">
              {cart.map(item => (
                <div key={item.id} className="checkout-summary-row">
                  <span>{item.name} × {item.qty}</span>
                  <strong>Rs. {(item.price * item.qty).toLocaleString()}</strong>
                </div>
              ))}
              <div className="checkout-summary-row total">
                <span>Total Raqam (Cash on Delivery):</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit}>
              <div className="form-group">
                <label>Pura Naam (Customer Name) *</label>
                <input type="text" value={custName} onChange={e => setCustName(e.target.value)} placeholder="e.g. Muhammad Hassan" required />
              </div>
              <div className="form-group">
                <label>Mobile / WhatsApp Number *</label>
                <input type="tel" value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="e.g. 0303-1234567" required />
              </div>
              <div className="form-group">
                <label>Delivery Pata (Full Address) *</label>
                <textarea value={custAddress} onChange={e => setCustAddress(e.target.value)} rows="2" placeholder="Gali / Mohallah, Alipur Chatha" required></textarea>
              </div>

              <div className="payment-method-box">
                <span style={{ fontSize: '1.4rem' }}>💵</span>
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '2px' }}>Saman delivery ke waqt payment ada karein</p>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '18px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCheckoutOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmittingOrder} style={{ background: '#2563eb', color: 'white', fontWeight: 700 }}>
                  {isSubmittingOrder ? 'Order Book Ho Raha Hai...' : '✅ Order Book Karein'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container" id="toastContainer">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
