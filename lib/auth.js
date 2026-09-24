const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'singer_digital_secret_key_2026';

function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyAdminToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  JWT_SECRET
};
