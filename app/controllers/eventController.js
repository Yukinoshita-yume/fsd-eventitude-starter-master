const e = require('express');
const eventModel = require('../models/event');
const questionModel = require('../models/question');
const { eventSchema,updateEventSchema } = require('../utils/schema');

// 创建事件
exports.create = (req, res, next) => {
    const {error} = eventSchema.validate(req.body);
    if (error) {
        return res.fail(error.details[0].message, 400);
    }
    
    const event = { ...req.body, creator_id: req.user.user_id };
    eventModel.insert(event, (err, eventId) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        eventModel.addAttendee(eventId, req.user.user_id, (err, changes) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
        });
        return res.success({event_id: eventId}, 201);
    });
};

// 获取单个事件详情
exports.get = (req, res, next) => {
    const eventId = parseInt(req.params.event_id);
    const userId = req.user ? req.user.user_id : null;
    if (isNaN(eventId)) {
        return res.fail('Invalid event ID', 400);
    }
    
    eventModel.findById(eventId, (err, event) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!event) {
            return res.fail('Event not found', 404);
        }
        
        // 获取参与者信息
        eventModel.getAttendees(eventId, (err, attendees) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            
            // 获取问题信息
            questionModel.getByEventId(eventId, (err, questions) => {
                if (err) {
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                const questionsFormatted = questions.map(q => ({
                    question_id: q.question_id,
                    question: q.question,
                    votes: q.votes,
                    asked_by: {
                        user_id: q.user_id,
                        first_name: q.first_name,
                    }
                }));

                // 获取参与者数量
                eventModel.getAttendeeCount(eventId, (err, count) => {
                    if (err) {
                        console.error(err);
                        return res.fail('Database error', 500);
                    }
                    
                    const eventDetails = {
                        event_id: event.event_id,
                        creator: {
                            creator_id: event.creator_id,
                            first_name: event.first_name,
                            last_name: event.last_name,
                            email: event.creator_email
                        },
                        name: event.name,
                        description: event.description,
                        location: event.location,
                        start: event.start_date,
                        close_registration: event.close_registration,
                        max_attendees: event.max_attendees,
                        number_attending: count,
                        questions: questionsFormatted
                    };
                    if(userId == event.creator_id){
                        eventDetails.attendees = attendees;
                        return res.success(eventDetails);
                    }
                    else {
                        console.log("check is attending");
                        eventModel.isUserAttending(eventId, userId, (err, isAttending) => {
                            if (err) {
                                console.error(err);
                                return res.fail('Database error', 500);
                            }
                            if (isAttending) {
                                eventDetails.isAttending = true;
                            }
                            else {
                                eventDetails.isAttending = false;
                            }
                            return res.success(eventDetails);
                    });}
                });
            });
        });
    });
};

// 更新事件
exports.update = (req, res, next) => {
    const eventId = parseInt(req.params.event_id);
    if (isNaN(eventId)) {
        return res.fail('Invalid event ID', 400);
    }
    
    const {error} = updateEventSchema.validate(req.body);
    if (error) {
        return res.fail(error.details[0].message, 400);
    }
    
    // 检查是否是事件创建者
    eventModel.findById(eventId, (err, event) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!event) {
            return res.fail('Event not found', 404);
        }
        if (event.creator_id !== req.user.user_id) {
            return res.fail('You can only update your own events', 403);
        }
        
        const updatedEvent = { ...req.body };
        eventModel.updateById(eventId, updatedEvent, (err, changes) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            return res.success({});
        });
    });
};

// 删除事件
exports.delete = (req, res, next) => {
    const eventId = parseInt(req.params.event_id);
    if (isNaN(eventId)) {
        return res.fail('Invalid event ID', 400);
    }
    
    // 检查是否是事件创建者
    eventModel.findById(eventId, (err, event) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if (!event) {
            return res.fail('Event not found', 404);
        }
        if (event.creator_id !== req.user.user_id) {
            return res.fail('You can only delete your own events', 403);
        }
        
        eventModel.deleteById(eventId, (err, changes) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            return res.success({});
        });
    });
};

// 注册参加事件
exports.register = (req, res, next) => {
    const eventId = parseInt(req.params.event_id);
    if (isNaN(eventId)) {
        return res.fail('Invalid event ID', 400);
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

        // 检查是否是创建者
        if(event.creator_id === userId){
            return res.fail('You are already registered', 403);
        }
        
        // 检查是否已经注册
        eventModel.isUserAttending(eventId, userId, (err, isAttending) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            if (isAttending) {
                return res.fail('You are already registered', 403);
            }
            // 检查是否已满
            eventModel.getAttendeeCount(eventId, (err, count) => {
                // if (eventId === 3){
                //     console.log(count,event.max_attendees)
                // }
                if (err) {
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                if (count >= event.max_attendees) {
                    return res.fail('Event is at capacity', 403);
                }
                // 检查注册是否已关闭
                const now = Date.now();
                if (event.close_registration === -1 || event.close_registration < now) {
                    return res.fail('Registration is closed', 403);
                }
                
                // 注册用户
                eventModel.addAttendee(eventId, userId, (err, changes) => {
                    if (err) {
                        console.error(err);
                        return res.fail('Database error', 500);
                    }
                    return res.success({});
                });
            });
        });
    });
};

// 搜索事件
exports.search = (req, res, next) => {
    const filters = {
        q: req.query.q,
        status: req.query.status,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        userId: req.user ? req.user.user_id : null
    };
    
    // 验证limit和offset
    if (filters.limit < 1 || filters.limit > 100) {
        return res.fail('Limit must be between 1 and 100', 400);
    }
    if (filters.offset < 0) {
        return res.fail('Offset must be non-negative', 400);
    }
    
    // 验证status参数
    if (filters.status && !['MY_EVENTS', 'ATTENDING', 'OPEN', 'ARCHIVE'].includes(filters.status)) {
        return res.fail('Invalid status parameter', 400);
    }
    
    // 对于需要用户ID的状态，检查是否已登录
    if (['MY_EVENTS', 'ATTENDING'].includes(filters.status) && !filters.userId) {
        return res.fail('Authentication required for this status filter', 400);
    }
    
    eventModel.searchEvents(filters, (err, events) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        
        // 格式化事件数据
        const formattedEvents = events.map(event => ({
            event_id: event.event_id,
            creator: {
                creator_id: event.creator_id,
                first_name: event.first_name,
                last_name: event.last_name,
                email: event.creator_email
            },
            name: event.name,
            description: event.description,
            location: event.location,
            start: event.start_date,
            close_registration: event.close_registration,
            max_attendees: event.max_attendees
        }));
        
        return res.success(formattedEvents);
    });
};
