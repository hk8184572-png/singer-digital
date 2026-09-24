const { NextResponse } = require('next/server');
const { queryAll, runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await queryAll('SELECT * FROM orders ORDER BY id DESC');
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, items, totalAmount } = body;

    if (!customerPhone || !items || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Phone, items, and totalAmount are required.' }, { status: 400 });
    }

    const sql = `
      INSERT INTO orders (customer_name, customer_phone, customer_address, items_json, total_amount, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    const res = await runQuery(sql, [
      customerName || 'In-Store Customer',
      customerPhone,
      customerAddress || 'Alipur Chatha',
      JSON.stringify(items),
      totalAmount
    ]);

    return NextResponse.json({
      success: true,
      orderId: res.lastID,
      message: 'Order saved in database!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
