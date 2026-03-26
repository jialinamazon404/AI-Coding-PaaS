const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'calculator-secret-key-2024';

class AuthService {
  static async register(username, password) {
    const existingUser = User.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = User.create(username, hashedPassword);

    const token = jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: userId, username }
    };
  }

  static async login(username, password) {
    const user = User.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user.id, username: user.username }
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }
}

module.exports = AuthService;