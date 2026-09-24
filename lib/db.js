const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(process.cwd(), 'shop.db');

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err.message);
      } else {
        console.log('Connected to SQLite database at', dbPath);
        initTables();
      }
    });
  }
  return dbInstance;
}

function initTables() {
  const db = dbInstance;
  db.serialize(() => {
    // 1. Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        price INTEGER NOT NULL,
        old_price INTEGER,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        badge TEXT DEFAULT '',
        badge_text TEXT DEFAULT '',
        image TEXT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT,
        items_json TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Inquiries Table
    db.run(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'New',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Settings Table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Seed default settings
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('phone_primary', '0303-2997825')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('phone_secondary', '0302-6674808')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('shop_address', 'Gujranwala Road, Alipur Chatha, Opp. Bank of Punjab')`);

    // 5. Admins Table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
        if (!err && (!row || row.count === 0)) {
          const defaultHash = bcrypt.hashSync('admin123', 10);
          db.run(
            'INSERT OR IGNORE INTO admins (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
            ['admin', defaultHash, 'Admin Hassan', 'superadmin']
          );
        }
      });
    });

    // Check products seeding
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (!err && row && row.count === 0) {
        seedInitialProducts();
      }
    });
  });
}

function seedInitialProducts() {
  const db = dbInstance;
  const seedProducts = [
    {
      name: "Philips Air Fryer Digital 12.5 Litres HD9788 Dual Elements",
      category: "Air Fryer",
      brand: "Philips",
      price: 29950,
      old_price: 36000,
      rating: 5,
      reviews_count: 48,
      badge: "hot",
      badge_text: "Special Deal",
      image: "images/philips_airfryer_hd9788_clean.png"
    },
    {
      name: "Philips Avance Collection Food Processor HR7776/91 1300W",
      category: "Food Processor",
      brand: "Philips",
      price: 38500,
      old_price: 44000,
      rating: 5,
      reviews_count: 32,
      badge: "sale",
      badge_text: "1300W 3-in-1",
      image: "images/philips_food_processor_hr7776_clean.png"
    },
    {
      name: "Electric Kaital / Stainless Steel Cordless Kettle 2.0L",
      category: "Electric Kaital",
      brand: "Philips",
      price: 3500,
      old_price: 4500,
      rating: 4.9,
      reviews_count: 55,
      badge: "hot",
      badge_text: "Best Seller",
      image: "images/electric_kettle.jpg"
    },
    {
      name: "TCL 55\" 4K UHD Smart Google Android LED TV",
      category: "LED",
      brand: "TCL",
      price: 98000,
      old_price: 115000,
      rating: 5,
      reviews_count: 44,
      badge: "sale",
      badge_text: "4K HDR",
      image: "images/tcl_smart_led.jpg"
    },
    {
      name: "Gree 1.5 Ton Fairy Inverter AC (Heat & Cool) Energy Saver",
      category: "AC",
      brand: "Gree",
      price: 158000,
      old_price: 178000,
      rating: 5,
      reviews_count: 63,
      badge: "hot",
      badge_text: "T3 Inverter",
      image: "images/gree_inverter_ac.jpg"
    },
    {
      name: "Dawlance Heavy Weight Dry Iron",
      category: "Iron",
      brand: "Dawlance",
      price: 6500,
      old_price: 7800,
      rating: 4.8,
      reviews_count: 29,
      badge: "sale",
      badge_text: "Original Heavy",
      image: "images/dawlance_heavy_dry_iron.jpg"
    },
    {
      name: "Super Asia Washing Machine SA280 Semi Automatic",
      category: "Washing Machine",
      brand: "Super Asia",
      price: 28500,
      old_price: 33000,
      rating: 4.9,
      reviews_count: 40,
      badge: "hot",
      badge_text: "Heavy Duty Motor",
      image: "images/super_asia_sa280.png"
    },
    {
      name: "Honda CD 70 2026 Model Brand New",
      category: "Motor Bike",
      brand: "Honda",
      price: 157900,
      old_price: 165000,
      rating: 5,
      reviews_count: 88,
      badge: "hot",
      badge_text: "2026 Model",
      image: "images/honda_cd70.jpg"
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, category, brand, price, old_price, rating, reviews_count, badge, badge_text, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedProducts.forEach((p) => {
    stmt.run(p.name, p.category, p.brand, p.price, p.old_price, p.rating, p.reviews_count, p.badge, p.badge_text, p.image);
  });
  stmt.finalize();
}

// Promise Helper Wrappers
function queryAll(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function queryOne(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function runQuery(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  getDb,
  queryAll,
  queryOne,
  runQuery
};
