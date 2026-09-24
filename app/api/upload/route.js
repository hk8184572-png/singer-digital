const { NextResponse } = require('next/server');
const fs = require('fs');
const path = require('path');
const { verifyAdminToken } = require('@/lib/auth');

export async function POST(req) {
  const admin = verifyAdminToken(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('product_image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No image file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${base}_${Date.now()}${ext}`;

    // Write to public/images directory so Next.js static server serves it
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }
    const filePath = path.join(publicImagesDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Also write to root images directory if present for legacy sync
    const rootImagesDir = path.join(process.cwd(), 'images');
    if (fs.existsSync(rootImagesDir)) {
      fs.writeFileSync(path.join(rootImagesDir, filename), buffer);
    }

    const relativePath = `images/${filename}`;
    return NextResponse.json({
      success: true,
      imageUrl: relativePath,
      message: 'Image uploaded successfully!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
