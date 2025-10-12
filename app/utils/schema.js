const Joi = require('joi');

const userSchema = Joi.object({
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(18)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,18}$/)
    .required()
}).unknown(false);

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).unknown(false);

const eventSchema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    location: Joi.string().min(1).required(),
    start: Joi.number().integer().min(Date.now()).required(),
    close_registration: Joi.number().integer().min(0).required(),
    max_attendees: Joi.number().integer().min(1).required()
}).unknown(false).custom((value, helpers) => {
    if (value.close_registration >= value.start) {
        return helpers.error('custom.closeRegistrationAfterStart');
    }
    return value;
}, 'Event validation').messages({
    'custom.closeRegistrationAfterStart': 'Registration must close before the start time'
});

const updateEventSchema = Joi.object({
  name: Joi.string().min(1).optional()
    .messages({
      'string.base': 'Event name must be a string',
      'string.min': 'Event name must have at least 1 character'
    }),

  description: Joi.string().min(1).optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must have at least 1 character'
    }),

  location: Joi.string().min(1).optional()
    .messages({
      'string.base': 'Location must be a string',
      'string.min': 'Location must have at least 1 character'
    }),

  start: Joi.date().timestamp('javascript').min('now').optional()
    .messages({
      'date.base': 'Start time must be a valid timestamp',
      'date.min': 'Start time cannot be in the past'
    }),

  close_registration: Joi.date().timestamp('javascript').min(0).optional()
    .messages({
      'date.base': 'Close registration time must be a valid timestamp',
      'date.min': 'Close registration time must be a positive timestamp'
    }),

  max_attendees: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Max attendees must be a number',
      'number.integer': 'Max attendees must be an integer',
      'number.min': 'Max attendees must be at least 1'
    })
})
  //至少存在一个字段
  .or('name', 'description', 'location', 'start', 'close_registration', 'max_attendees')
  .unknown(false)

  .custom((value, helpers) => {
    if (value.close_registration != null && value.start != null) {
      if (value.close_registration >= value.start) {
        return helpers.message('Registration must close before the event start time');
      }
    }
    return value;
  }, 'Event validation')
  .messages({
    'object.missing': 'At least one field must be provided (e.g. name, description, location, start, close_registration, or max_attendees)'
  });


const questionSchema = Joi.object({
    question: Joi.string().min(1).required()
}).unknown(false);

module.exports = {
    userSchema,
    loginSchema,
    eventSchema,
    updateEventSchema,
    questionSchema
};