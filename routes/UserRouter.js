
const express = require('express');
const router = express.Router();

const isActiveMiddleware = require('../middleware/verifyPermissionMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/UserController');

router.get('/user', userController.getUser);
router.put('/modify/:id', authMiddleware, isActiveMiddleware.userId, userController.updateUser);
router.delete('/disableAccount/:id', authMiddleware, isActiveMiddleware.userId, userController.inactivateUser);

module.exports = router;

