// ==========================================
// Singer Digital National Electronics - Server
// Express REST API + Static Files Server
// ==========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5500;
const JWT_SECRET = process.env.JWT_SECRET || 'singer_digital_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files and images
app.use(express.static(__dirname));

// Authentication Middleware for Protected Admin Routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  }
});
const upload = multer({ storage: storage });

// ==========================================
// 0. AUTHENTICATION API
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username aur password dono zaroori hain.' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username.trim()], (err, admin) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Ghalat username ya password.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Ghalat username ya password.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      },
      message: 'Login kamyab raha!'
    });
  });
});

// GET /api/auth/me (Verify active session)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.user });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Purana aur naya password dono required hain.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Naya password kam az kam 6 characters ka hona chahiye.' });
  }

  db.get('SELECT * FROM admins WHERE id = ?', [req.user.id], (err, admin) => {
    if (err || !admin) return res.status(500).json({ success: false, error: 'Admin record nahi mila.' });

    const isMatch = bcrypt.compareSync(oldPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Purana password ghalat hai.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.user.id], (upErr) => {
      if (upErr) return res.status(500).json({ success: false, error: upErr.message });
      res.json({ success: true, message: 'Password kamyabi se tabdeel ho gaya!' });
    });
  });
});

// ==========================================
// 1. PRODUCTS API
// ==========================================

// GET /api/products
app.get('/api/products', (req, res) => {
  const { category, brand, search } = req.query;
  let query = 'SELECT * FROM products WHERE in_stock = 1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND (LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?))';
    params.push(category, `%${category}%`);
  }

  if (brand) {
    query += ' AND LOWER(brand) = LOWER(?)';
    params.push(brand);
  }

  if (search) {
    query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(brand) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY id DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    // Format to match frontend structure
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      brand: r.brand,
      price: r.price,
      oldPrice: r.old_price,
      rating: r.rating,
      reviews: r.reviews_count,
      badge: r.badge,
      badgeText: r.badge_text,
      image: r.image
    }));
    res.json({ success: true, products: formatted });
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({
      success: true,
      product: {
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        price: row.price,
        oldPrice: row.old_price,
        rating: row.rating,
        reviews: row.reviews_count,
        badge: row.badge,
        badgeText: row.badge_text,
        image: row.image
      }
    });
  });
});

// POST /api/products (Admin Add)
app.post('/api/products', authMiddleware, (req, res) => {
  const { name, category, brand, price, oldPrice, badge, badgeText, image } = req.body;
  if (!name || !category || !brand || !price) {
    return res.status(400).json({ success: false, error: 'Name, category, brand, and price are required.' });
  }

  const query = `
    INSERT INTO products (name, category, brand, price, old_price, badge, badge_text, image, rating, reviews_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, 10)
  `;
  const imgUrl = image || 'images/shop_front.jpg';

  db.run(query, [name, category, brand, price, oldPrice || null, badge || '', badgeText || '', imgUrl], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      message: 'Product added successfully!',
      productId: this.lastID
    });
  });
});

// PUT /api/products/:id (Admin Update)
app.put('/api/products/:id', authMiddleware, (req, res) => {
  const { name, category, brand, price, oldPrice, badge, badgeText, image } = req.body;
  const id = req.params.id;

  const query = `
    UPDATE products 
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        brand = COALESCE(?, brand),
        price = COALESCE(?, price),
        old_price = ?,
        badge = COALESCE(?, badge),
        badge_text = COALESCE(?, badge_text),
        image = COALESCE(?, image)
    WHERE id = ?
  `;

  db.run(query, [name, category, brand, price, oldPrice, badge, badgeText, image, id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Product updated successfully!' });
  });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Product deleted successfully!' });
  });
});

// ==========================================
// 2. IMAGE UPLOAD API
// ==========================================
app.post('/api/upload', authMiddleware, upload.single('product_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image uploaded.' });
  }
  const relativePath = `images/${req.file.filename}`;
  res.json({
    success: true,
    imageUrl: relativePath,
    message: 'Image uploaded successfully!'
  });
});

// ==========================================
// 3. ORDERS API
// ==========================================

// GET /api/orders (Admin)
app.get('/api/orders', authMiddleware, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));
    res.json({ success: true, orders });
  });
});

// POST /api/orders (Customer checkout)
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;
  if (!customerPhone || !items || !totalAmount) {
    return res.status(400).json({ success: false, error: 'Phone, items, and totalAmount are required.' });
  }

  const query = `
    INSERT INTO orders (customer_name, customer_phone, customer_address, items_json, total_amount, status)
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;

  db.run(query, [
    customerName || 'In-Store Customer',
    customerPhone,
    customerAddress || 'Alipur Chatha',
    JSON.stringify(items),
    totalAmount
  ], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      orderId: this.lastID,
      message: 'Order saved in database!'
    });
  });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Order status updated!' });
  });
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM orders WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Order deleted!' });
  });
});

// ==========================================
// 4. INQUIRIES API (Contact Form)
// ==========================================

// GET /api/inquiries
app.get('/api/inquiries', authMiddleware, (req, res) => {
  db.all('SELECT * FROM inquiries ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, inquiries: rows });
  });
});

// POST /api/inquiries
app.post('/api/inquiries', (req, res) => {
  const { name, phone, subject, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, error: 'Name, phone, and message are required.' });
  }

  const query = 'INSERT INTO inquiries (name, phone, subject, message) VALUES (?, ?, ?, ?)';
  db.run(query, [name, phone, subject || 'General', message], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      inquiryId: this.lastID,
      message: 'Inquiry received successfully!'
    });
  });
});

// DELETE /api/inquiries/:id
app.delete('/api/inquiries/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM inquiries WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Inquiry deleted!' });
  });
});

// ==========================================
// 5. STATS API (Admin Overview)
// ==========================================
app.get('/api/stats', authMiddleware, (req, res) => {
  db.get('SELECT COUNT(*) as totalProducts FROM products', (err, prodRow) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    db.get('SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders', (err, orderRow) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      db.get("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'Pending'", (err, pendingRow) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        db.get('SELECT COUNT(*) as totalInquiries FROM inquiries', (err, inqRow) => {
          if (err) return res.status(500).json({ success: false, error: err.message });

          res.json({
            success: true,
            stats: {
              totalProducts: prodRow.totalProducts,
              totalOrders: orderRow.totalOrders,
              totalRevenue: orderRow.totalRevenue,
              pendingOrders: pendingRow.pendingOrders,
              totalInquiries: inqRow.totalInquiries
            }
          });
        });
      });
    });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Singer Digital Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin Panel at http://localhost:${PORT}/admin.html`);
  console.log(`===============================================`);
});
