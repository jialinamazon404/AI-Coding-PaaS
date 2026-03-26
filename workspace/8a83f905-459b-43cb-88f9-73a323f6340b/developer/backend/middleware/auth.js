const AuthService = require('../services/authService');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '无效的令牌' });
  }
};

module.exports = auth;