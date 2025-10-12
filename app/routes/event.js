const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../utils/jwt').authMiddleware;
const optionalAuthMiddleware = require('../utils/jwt').optionalAuthMiddleware;

// POST /events - 创建事件 (需要认证)
router.post('/', authMiddleware, eventController.create);

// GET /event/:event_id - 获取单个事件详情
router.get('/:event_id', optionalAuthMiddleware,eventController.get);

// PATCH /event/:event_id - 更新事件 (需要认证,仅创建者)
router.patch('/:event_id', authMiddleware, eventController.update);

// DELETE /event/:event_id - 删除事件 (需要认证,仅创建者)
router.delete('/:event_id', authMiddleware, eventController.delete);

// POST /event/:event_id - 注册参加事件 (需要认证)
router.post('/:event_id', authMiddleware, eventController.register);

module.exports = router;
