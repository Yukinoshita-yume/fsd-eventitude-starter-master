const questionModel = require('../models/question');
const eventModel = require('../models/event');
const { questionSchema } = require('../utils/schema');

// 创建问题
exports.create = (req, res, next) => {
    const eventId = parseInt(req.params.event_id);
    if (isNaN(eventId)) {
        return res.fail('Invalid event ID', 400);
    }
    
    const {error} = questionSchema.validate(req.body);
    if (error) {
        return res.fail(error.details[0].message, 400);
    }
    
    const userId = req.user.user_id;
    
    // 检查事件是否存在
    eventModel.findById(eventId, (err, event) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!event) {
            return res.fail('Event not found', 404);
        }
        
        // 检查是否是事件创建者
        if (event.creator_id === userId) {
            return res.fail('You cannot ask questions on your own events', 403);
        }
        
        // 检查用户是否已注册参加事件
        eventModel.isUserAttending(eventId, userId, (err, isAttending) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            if (!isAttending) {
                return res.fail('You cannot ask questions on events you are not registered for', 403);
            }
            
            // 创建问题
            const question = {
                question: req.body.question,
                asked_by: userId,
                event_id: eventId
            };
            
            questionModel.insert(question, (err, questionId) => {
                if (err) {
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                return res.success({question_id: questionId}, 201);
            });
        });
    });
};

// 删除问题
exports.delete = (req, res, next) => {
    const questionId = parseInt(req.params.question_id);
    if (isNaN(questionId)) {
        return res.fail('Invalid question ID', 400);
    }
    
    const userId = req.user.user_id;
    
    // 获取问题信息
    questionModel.findById(questionId, (err, question) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!question) {
            return res.fail('Question not found', 404);
        }
        
        // 检查权限：问题作者或事件创建者
        eventModel.findById(question.event_id, (err, event) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            
            if (question.asked_by !== userId && event.creator_id !== userId) {
                return res.fail('You can only delete questions that you have authored, or for events that you have created', 403);
            }
            
            // 删除问题
            questionModel.deleteById(questionId, (err, changes) => {
                if (err) {
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                return res.success({});
            });
        });
    });
};

// 点赞问题
exports.upvote = (req, res, next) => {
    const questionId = parseInt(req.params.question_id);
    if (isNaN(questionId)) {
        return res.fail('Invalid question ID', 400);
    }
    
    const userId = req.user.user_id;
    
    // 检查问题是否存在
    questionModel.findById(questionId, (err, question) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!question) {
            return res.fail('Question not found', 404);
        }
        
        // 检查是否已经投票
        questionModel.hasUserVoted(questionId, userId, (err, hasVoted) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            if (hasVoted) {
                return res.fail('You have already voted on this question', 403);
            }
            
            // 点赞
            questionModel.upvote(questionId, userId, (err, changes) => {
                if (err) {
                    if (err.message === 'Already voted') {
                        return res.fail('You have already voted on this question', 403);
                    }
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                return res.success({});
            });
        });
    });
};

// 踩问题
exports.downvote = (req, res, next) => {
    const questionId = parseInt(req.params.question_id);
    if (isNaN(questionId)) {
        return res.fail('Invalid question ID', 400);
    }
    
    const userId = req.user.user_id;
    
    // 检查问题是否存在
    questionModel.findById(questionId, (err, question) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!question) {
            return res.fail('Question not found', 404);
        }
        
        // 检查是否已经投票
        questionModel.hasUserVoted(questionId, userId, (err, hasVoted) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            if (hasVoted) {
                return res.fail('You have already voted on this question', 403);
            }
            
            // 踩
            questionModel.downvote(questionId, userId, (err, changes) => {
                if (err) {
                    if (err.message === 'Already voted') {
                        return res.fail('You have already voted on this question', 403);
                    }
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                return res.success({});
            });
        });
    });
};

// Get all questions by user ID
exports.getByUserId = (req, res, next) => {
    const userId = req.user.user_id;
    
    questionModel.getByUserId(userId, (err, questions) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        
        return res.success(questions);
    });
};