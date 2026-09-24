// ==========================================
// Singer Digital National Electronics - Database
// SQLite setup and initial seed data
// ==========================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'shop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initTables();
  }
});

function initTables() {
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
      // Seed default admin if table is empty
      db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
        if (!err && (!row || row.count === 0)) {
          const defaultHash = bcrypt.hashSync('admin123', 10);
          db.run(
            'INSERT OR IGNORE INTO admins (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
            ['admin', defaultHash, 'Admin Hassan', 'superadmin'],
            (insertErr) => {
              if (!insertErr) {
                console.log('👤 Default admin account seeded: username: admin / password: admin123');
              }
            }
          );
        }
      });
    });

    // Check if products need initial seeding
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('Check products error:', err);
        return;
      }
      if (row.count === 0) {
        console.log('Seeding initial products into database...');
        seedInitialProducts();
      } else {
        console.log(`Database already has ${row.count} products.`);
      }
    });
  });
}

function seedInitialProducts() {
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
      name: "Haier 1.5 Ton Thunder Inverter AC DC Inverter T3",
      category: "AC",
      brand: "Haier",
      price: 142000,
      old_price: 160000,
      rating: 4.9,
      reviews_count: 38,
      badge: "sale",
      badge_text: "Top Inverter",
      image: "images/dawlance_inverter_ac_2ton.jpg"
    },
    {
      name: "Orient 43\" Smart Frameless Android LED TV",
      category: "LED",
      brand: "Orient",
      price: 68000,
      old_price: 78000,
      rating: 4.8,
      reviews_count: 29,
      badge: "sale",
      badge_text: "Frameless",
      image: "images/tcl_smart_led.jpg"
    },
    {
      name: "Multinet 40\" Smart Android HD LED TV",
      category: "LED",
      brand: "Multinet",
      price: 54000,
      old_price: 62000,
      rating: 4.7,
      reviews_count: 22,
      badge: "",
      badge_text: "",
      image: "images/media_1789642507725.png"
    },
    {
      name: "Dawlance Inverter Refrigerator 91996 Chrome Line",
      category: "Fridges",
      brand: "Dawlance",
      price: 128999,
      old_price: 142000,
      rating: 5,
      reviews_count: 58,
      badge: "sale",
      badge_text: "10% OFF",
      image: "images/media_1789641946550.png"
    },
    {
      name: "Dawlance Fully Automatic Washing Machine 10Kg",
      category: "Washing Machines",
      brand: "Dawlance",
      price: 65000,
      old_price: 76500,
      rating: 5,
      reviews_count: 41,
      badge: "hot",
      badge_text: "Automatic",
      image: "images/media_1789642116638.png"
    },
    {
      name: "Super Asia Double Tub Semi-Automatic Washing Machine SA-280",
      category: "Washing Machines",
      brand: "Super Asia",
      price: 48000,
      old_price: 54000,
      rating: 4.8,
      reviews_count: 35,
      badge: "hot",
      badge_text: "Double Tub",
      image: "images/super_asia_sa280.png"
    },
    {
      name: "Dawlance Deep Freezer Double Door Heavy Duty",
      category: "Deep Freezers",
      brand: "Dawlance",
      price: 108000,
      old_price: 118000,
      rating: 4.8,
      reviews_count: 27,
      badge: "sale",
      badge_text: "Best Seller",
      image: "images/media_1789642419108.png"
    },
    {
      name: "Dawlance Digital Microwave Oven with Grill",
      category: "Microwave",
      brand: "Dawlance",
      price: 24500,
      old_price: 28000,
      rating: 4.7,
      reviews_count: 19,
      badge: "",
      badge_text: "",
      image: "images/media_1789642762026.png"
    },
    {
      name: "Vivo Y27s / Y28 4G Official PTA Approved",
      category: "Mobile Phones",
      brand: "Vivo",
      price: 46999,
      old_price: 52000,
      rating: 4.9,
      reviews_count: 47,
      badge: "hot",
      badge_text: "Official PTA",
      image: "images/vivo_smartphone.png"
    },
    {
      name: "Samsung Galaxy Smartphone Official PTA Approved",
      category: "Mobile Phones",
      brand: "Samsung",
      price: 132000,
      old_price: 145000,
      rating: 4.9,
      reviews_count: 73,
      badge: "hot",
      badge_text: "Official PTA",
      image: "images/samsung_galaxy_phone.jpg"
    },
    {
      name: "Apple iPhone 15 Pro Max 256GB Dual SIM / e-SIM",
      category: "Mobile Phones",
      brand: "Apple",
      price: 435000,
      old_price: 460000,
      rating: 5,
      reviews_count: 89,
      badge: "hot",
      badge_text: "Apple Official",
      image: "images/iphone_15.jpg"
    },
    {
      name: "Honda CD 70cc 2026 Model Euro II Genuine",
      category: "Motor Bike",
      brand: "Honda",
      price: 159900,
      old_price: 165000,
      rating: 5,
      reviews_count: 112,
      badge: "hot",
      badge_text: "Cash / Qist",
      image: "images/honda_cd70.jpg"
    },
    {
      name: "Electric Scooty / Bike High Speed Lithium Battery",
      category: "Motor Bike",
      brand: "Electric",
      price: 177000,
      old_price: 195000,
      rating: 4.8,
      reviews_count: 31,
      badge: "sale",
      badge_text: "Eco Saver",
      image: "images/media_1789643291879.png"
    },
    {
      name: "Dawlance Heavy Dry Iron / Istari 1000W",
      category: "Iron",
      brand: "Dawlance",
      price: 10500,
      old_price: 12000,
      rating: 4.9,
      reviews_count: 46,
      badge: "",
      badge_text: "",
      image: "images/dawlance_heavy_dry_iron.jpg"
    },
    {
      name: "National 3-in-1 Juicer Blender Grinder Machine",
      category: "Food Processor",
      brand: "National",
      price: 11500,
      old_price: 13500,
      rating: 4.7,
      reviews_count: 38,
      badge: "sale",
      badge_text: "National Original",
      image: "images/media_1789643007198.png"
    },
    {
      name: "Dawlance Air Fryer Healthy Cooking",
      category: "Air Fryer",
      brand: "Dawlance",
      price: 20500,
      old_price: 24000,
      rating: 4.8,
      reviews_count: 25,
      badge: "hot",
      badge_text: "Special",
      image: "images/media_1789642919620.png"
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, category, brand, price, old_price, rating, reviews_count, badge, badge_text, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedProducts.forEach((p) => {
    stmt.run(p.name, p.category, p.brand, p.price, p.old_price, p.rating, p.reviews_count, p.badge, p.badge_text, p.image);
  });

  stmt.finalize(() => {
    console.log(`Successfully seeded ${seedProducts.length} products!`);
  });
}

module.exports = db;
