const express = require('express');
const router = express.Router();

const verify = require('../middleware/verifyPermissionMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/OrderController');

router.get('/search', authMiddleware, verify.verifyUserRole('Administrador'), orderController.getOrders);
router.post('/create/:restaurantId', authMiddleware, verify.verifyUserRole('Cliente'), verify.verifyProducts, orderController.createOrder);
router.get('/:orderId', authMiddleware, verify.verifyUserRole('Administrador'), verify.verifyOrderId, orderController.getOrder);

router.patch('/modify/:orderId', authMiddleware,
    verify.verifyUserRole('Administrador'),
    verify.verifyOrderId,
    verify.verifyOrderState,
    orderController.updateOrder);

router.delete('/disable/:orderId', authMiddleware,
    verify.verifyUserRole('Administrador'),
    verify.verifyOrderId,
    orderController.inactivateOrder);

module.exports = router;