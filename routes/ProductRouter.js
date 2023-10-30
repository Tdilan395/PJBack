const express = require('express');
const router = express.Router();

const verifyPermissionMiddleware = require('../middleware/verifyPermissionMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/ProductController');


router.get('/search', authMiddleware, productController.searchProducts);

router.post('/create/:restaurantId', authMiddleware, verifyPermissionMiddleware.restaurantId, productController.createProduct);
router.get('/:productId', authMiddleware, verifyPermissionMiddleware.productId, productController.getProduct);
router.patch('/modify/:productId', authMiddleware, verifyPermissionMiddleware.productId, productController.updateProduct);
router.delete('/disable/:productId', authMiddleware, verifyPermissionMiddleware.productId, productController.deleteProduct);





module.exports = router;