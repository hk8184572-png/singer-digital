const { NextResponse } = require('next/server');
const { queryAll, runQuery } = require('@/lib/db');
const { verifyAdminToken } = require('@/lib/auth');

export async function GET(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await queryAll('SELECT * FROM inquiries ORDER BY id DESC');
    return NextResponse.json({ success: true, inquiries: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ success: false, error: 'Name, phone, and message are required.' }, { status: 400 });
    }

    const sql = 'INSERT INTO inquiries (name, phone, subject, message) VALUES (?, ?, ?, ?)';
    const res = await runQuery(sql, [name, phone, subject || 'General', message]);

    return NextResponse.json({
      success: true,
      inquiryId: res.lastID,
      message: 'Inquiry received successfully!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
