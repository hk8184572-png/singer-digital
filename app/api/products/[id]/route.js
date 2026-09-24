const { NextResponse } = require('next/server');
const { queryOne, runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const row = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({
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
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, brand, price, oldPrice, badge, badgeText, image } = body;

    const sql = `
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

    await runQuery(sql, [name, category, brand, price, oldPrice, badge, badgeText, image, id]);
    return NextResponse.json({ success: true, message: 'Product updated successfully!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await runQuery('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Product deleted successfully!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
