const userModel = require('../models/user');
const crypto = require('crypto');
const { loginSchema } = require('../utils/schema');

// 用户登录
exports.login = function(req, res){
    const {error} = loginSchema.validate(req.body);
    if (error) {
        return res.fail(error.details[0].message, 400);
    }
    
    const { email, password } = req.body;
    userModel.authenticateUser(email, (err,hasLogin,user) => {
            if (err) {
                console.error(err);
                return res.fail('Database error', 500);
            }
            if (!user) {
                return res.fail('Invalid email or password', 400);
            }
            const salt = Buffer.from(user.salt, 'hex');
            const pin = Buffer.from(user.password, 'hex');
            const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
            if (!crypto.timingSafeEqual(pin, hash)) {
                return res.fail('Invalid email or password', 400);
            }
            if(hasLogin){
                return res.success({ user_id: user.user_id, session_token: user.session_token });
            }
            // 生成32字符的session token
            const sessionToken = crypto.randomBytes(16).toString('hex');
            
            userModel.updateSessionToken(user.user_id, sessionToken, (err, changes) => {
                if (err) {
                    console.error(err);
                    return res.fail('Database error', 500);
                }
                return res.success({ user_id: user.user_id, session_token: sessionToken });
            });
        });
}

// 用户登出
exports.logout = function(req, res) {
    const sessionToken = req.headers['x-authorization'];
    if (!sessionToken) {
        return res.fail('Unauthorized', 401);
    }
    
    userModel.clearSessionToken(sessionToken, (err, changes) => {
        if (err) {
            console.error(err);
            return res.fail('Database error', 500);
        }
        if(changes == 0){
            console.log("Not logged in but try to logout");
            return res.fail('Unauthorized', 401);
        }
        return res.success({});
    });
}