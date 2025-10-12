const crypto = require('crypto');
const { userSchema } = require('../utils/schema');
const userModel = require('../models/user');

exports.create = (req, res, next) => {
  const {error} = userSchema.validate(req.body);
  if (error) {
      return res.fail(error.details[0].message, 400);
  }
  const salt = crypto.randomBytes(64);
  const hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512');
  const user = { ...req.body, password: hash.toString('hex'), salt: salt.toString('hex') };
  userModel.insert(user, (err, id) => {
      if (err) {
          console.error(err);
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
              return res.fail('Email already in use', 400);
          }
          return res.fail('Database error', 500);
      };
      return res.success({user_id: id}, 201);
  });
};
