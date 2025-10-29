const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../utils/jwt').authMiddleware;

// POST /event/:event_id/question - 创建问题 (需要认证,仅参与者)
router.post('/event/:event_id/question', authMiddleware, questionController.create);

// DELETE /question/:question_id - 删除问题 (需要认证,创建者或问题作者)
router.delete('/question/:question_id', authMiddleware, questionController.delete);

// POST /question/:question_id/vote - 点赞问题 (需要认证)
router.post('/question/:question_id/vote', authMiddleware, questionController.upvote);

// DELETE /question/:question_id/vote - 踩问题 (需要认证)
router.delete('/question/:question_id/vote', authMiddleware, questionController.downvote);

// GET /question/user - 获取当前用户的所有问题 (需要认证)
router.get('/question/user', authMiddleware, questionController.getByUserId);

module.exports = router;
