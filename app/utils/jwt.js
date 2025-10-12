
const userModel = require('../models/user');

// session token验证中间件
function authMiddleware(req, res, next) {
    const sessionToken = req.headers['x-authorization'];

    if (!sessionToken) {
        return res.status(401).json({ error_message: "Unauthorized" });
    }

    userModel.getBySessionToken(sessionToken, (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error_message: "Server Error" });
        }
        if (!user) {
            return res.status(401).json({ error_message: "Unauthorized" });
        }

        req.user = user; // 把用户信息放到req.user
        next();
    });
}
function optionalAuthMiddleware(req, res, next) {
    const sessionToken = req.headers['x-authorization'];
    if (!sessionToken) {
        return next(); // 没有token，继续处理请求
    }
    userModel.getBySessionToken(sessionToken, (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error_message: "Server Error" });
        }
        if (user) {
            req.user = user; // 把用户信息放到req.user
        }
        next();
    });
}

module.exports = {authMiddleware, optionalAuthMiddleware };
