const History = require('../models/History');

class CalculatorService {
  static calculate(expression) {
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    
    try {
      const result = Function('"use strict"; return (' + sanitized + ')')();
      
      if (!isFinite(result) || isNaN(result)) {
        throw new Error('无效的计算结果');
      }

      return {
        result: Number.isInteger(result) ? result : parseFloat(result.toFixed(10))
      };
    } catch (error) {
      throw new Error('无效的表达式');
    }
  }

  static saveHistory(userId, expression, result) {
    return History.create(userId, expression, String(result));
  }

  static getHistory(userId) {
    return History.findByUserId(userId);
  }

  static clearHistory(userId) {
    return History.deleteByUserId(userId);
  }
}

module.exports = CalculatorService;