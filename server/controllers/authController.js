import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { password } = req.body;
  if (password === 'admin88') {
    // Generate token
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });
    return res.status(200).json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
};
