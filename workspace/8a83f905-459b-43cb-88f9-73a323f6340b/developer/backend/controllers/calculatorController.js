const CalculatorService = require('../services/calculatorService');

const calculate = async (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({ success: false, message: '请输入表达式' });
    }

    const { result } = CalculatorService.calculate(expression);
    CalculatorService.saveHistory(req.user.userId, expression, result);

    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getHistory = (req, res) => {
  try {
    const history = CalculatorService.getHistory(req.user.userId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取历史记录失败' });
  }
};

const clearHistory = (req, res) => {
  try {
    CalculatorService.clearHistory(req.user.userId);
    res.json({ success: true, message: '历史记录已清空' });
  } catch (error) {
    res.status(500).json({ success: false, message: '清空历史记录失败' });
  }
};

module.exports = { calculate, getHistory, clearHistory };