const { NextResponse } = require('next/server');
const bcrypt = require('bcryptjs');
const { queryOne, runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function POST(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Purana aur naya password dono required hain.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Naya password kam az kam 6 characters ka hona chahiye.' }, { status: 400 });
    }

    const adminRow = await queryOne('SELECT * FROM admins WHERE id = ?', [admin.id]);
    if (!adminRow) {
      return NextResponse.json({ success: false, error: 'Admin record nahi mila.' }, { status: 500 });
    }

    const isMatch = bcrypt.compareSync(oldPassword, adminRow.password_hash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Purana password ghalat hai.' }, { status: 400 });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await runQuery('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, admin.id]);

    return NextResponse.json({ success: true, message: 'Password kamyabi se tabdeel ho gaya!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
