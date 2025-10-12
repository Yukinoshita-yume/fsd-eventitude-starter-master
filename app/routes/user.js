const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /users
router.post('/', userController.create);

module.exports = router;
