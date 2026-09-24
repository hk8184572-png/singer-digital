const { NextResponse } = require('next/server');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, admin });
}
