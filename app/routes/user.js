const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /users
router.post('/', userController.create);

// GET /users/:user_id
router.get('/:user_id', userController.getById);

module.exports = router;
