const { NextResponse } = require('next/server');
const { runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function PATCH(req, { params }) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await runQuery('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true, message: 'Order status updated!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
