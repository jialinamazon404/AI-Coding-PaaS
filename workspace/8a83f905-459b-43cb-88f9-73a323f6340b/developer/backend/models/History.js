const db = require('../config/database');

class History {
  static create(userId, expression, result) {
    const stmt = db.prepare('INSERT INTO history (user_id, expression, result) VALUES (?, ?, ?)');
    const result2 = stmt.run(userId, expression, result);
    return result2.lastInsertRowid;
  }

  static findByUserId(userId, limit = 10) {
    const stmt = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(userId, limit);
  }

  static deleteByUserId(userId) {
    const stmt = db.prepare('DELETE FROM history WHERE user_id = ?');
    return stmt.run(userId);
  }
}

module.exports = History;