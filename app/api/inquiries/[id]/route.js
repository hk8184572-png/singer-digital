const { NextResponse } = require('next/server');
const { runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function DELETE(req, { params }) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await runQuery('DELETE FROM inquiries WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Inquiry deleted!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
