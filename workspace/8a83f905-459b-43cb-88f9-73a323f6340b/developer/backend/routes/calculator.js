const express = require('express');
const router = express.Router();
const calculatorController = require('../controllers/calculatorController');
const auth = require('../middleware/auth');

router.post('/calculate', auth, calculatorController.calculate);
router.get('/history', auth, calculatorController.getHistory);
router.delete('/history', auth, calculatorController.clearHistory);

module.exports = router;