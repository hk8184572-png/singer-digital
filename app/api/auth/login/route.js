const { NextResponse } = require('next/server');
const bcrypt = require('bcryptjs');
const { queryOne } = require('@/lib/db');
const { signAdminToken } = require('@/lib/auth');

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username aur password required hain.' }, { status: 400 });
    }

    const admin = await queryOne('SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Ghalat username ya password.' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Ghalat username ya password.' }, { status: 401 });
    }

    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      },
      message: 'Login kamyab raha!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
