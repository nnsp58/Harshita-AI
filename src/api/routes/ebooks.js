const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');

// Define eBook routes
router.get('/products/:slug', ebookController.getProduct);
router.post('/orders', ebookController.createOrder);
router.post('/verify', ebookController.verifyPayment);
router.get('/download/:productId', ebookController.downloadProduct);

module.exports = router;
