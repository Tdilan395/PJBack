const express = require('express');
const router = express.Router();

const verifyPermissionMiddleware = require('../middleware/verifyPermissionMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const restaurantController = require('../controllers/RestaurantController');

router.post('/register', authMiddleware, verifyPermissionMiddleware.userId, restaurantController.register);
router.get('/search', authMiddleware, restaurantController.searchRestaurants);
router.get('/:restaurantId', authMiddleware, verifyPermissionMiddleware.restaurantId, restaurantController.getRestaurant);
router.put('/modify/:restaurantId', authMiddleware, verifyPermissionMiddleware.restaurantId, restaurantController.updateRestaurant);
router.delete('/disable/:restaurantId', authMiddleware, verifyPermissionMiddleware.restaurantId, restaurantController.inactivateRestaurant);

module.exports = router;

