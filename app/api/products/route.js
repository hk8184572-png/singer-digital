const { NextResponse } = require('next/server');
const { queryAll, runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM products WHERE in_stock = 1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND (LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?))';
      params.push(category, `%${category}%`);
    }

    if (brand) {
      sql += ' AND LOWER(brand) = LOWER(?)';
      params.push(brand);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(brand) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY id DESC';

    const rows = await queryAll(sql, params);
    const products = rows.map(r => ({
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

    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin token required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, category, brand, price, oldPrice, badge, badgeText, image } = body;

    if (!name || !category || !brand || !price) {
      return NextResponse.json({ success: false, error: 'Name, category, brand, and price are required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO products (name, category, brand, price, old_price, badge, badge_text, image, rating, reviews_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, 10)
    `;
    const imgUrl = image || 'images/shop_front.jpg';

    const res = await runQuery(sql, [
      name, category, brand, price, oldPrice || null, badge || '', badgeText || '', imgUrl
    ]);

    return NextResponse.json({
      success: true,
      message: 'Product added successfully!',
      productId: res.lastID
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
