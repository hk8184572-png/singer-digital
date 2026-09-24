const { NextResponse } = require('next/server');
const { queryOne } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prodRow = await queryOne('SELECT COUNT(*) as totalProducts FROM products');
    const orderRow = await queryOne('SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders');
    const pendingRow = await queryOne("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'Pending'");
    const inqRow = await queryOne('SELECT COUNT(*) as totalInquiries FROM inquiries');

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: prodRow ? prodRow.totalProducts : 0,
        totalOrders: orderRow ? orderRow.totalOrders : 0,
        totalRevenue: orderRow ? orderRow.totalRevenue : 0,
        pendingOrders: pendingRow ? pendingRow.pendingOrders : 0,
        totalInquiries: inqRow ? inqRow.totalInquiries : 0
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
