const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: '服务器内部错误' });
};

module.exports = errorHandler;