const db = require('../../database');

const insert = function(user, done){
    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
    const values = [user.first_name, user.last_name, user.email, user.password, user.salt];
    db.run(
        sql,
        values,
        function(err){
            if(err) return done(err);
            return done(null, this.lastID);
        }
    )
};
const deleteById = function(userId, done){
    const sql = 'DELETE FROM users WHERE user_id = ?';
    const values = [userId];
    db.run(
        sql,
        values,
        function(err){
            if(err) return done(err);
            return done(null, this.changes);
        }
    )
};
const updateById = function(userId, user, done){
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?';
    const values = [user.first_name, user.last_name, user.email, userId];
    db.run(
        sql,
        values,
        function(err){
            if(err) return done(err);
            return done(null, this.changes);
        }
    )
};
const findById = function(userId, done){
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const values = [userId];
    db.get(
        sql,
        values,
        function(err, row){
            if(err) return done(err);
            return done(null, row);
        }   
    )
};

const showAll = function(done){
    const sql = 'SELECT * FROM users';
    db.all(
        sql,
        function(err, rows){
            if(err) return done(err);
            return done(null, rows);
        }
    )
};

const authenticateUser = function(email, done){
    const sql = 'SELECT user_id, password, salt, session_token FROM users WHERE email = ? ';
    const values = [email];
    db.get(
        sql,
        values,
        function(err, row){
            if(err) return done(err);
            return done(null,row&&row.session_token,row);
        }
    )
};

const getPinById = function(userId, done){
    const sql = 'SELECT password FROM users WHERE user_id = ?';
    const values = [userId];
    db.get(
        sql,
        values,
        function(err, row){ 
            if(err) return done(err);
            return done(null, row);
        }
    )
};
// const checkHasLogin = function(email, done) {
//     const sql = 'SELECT user_id, session_token FROM users WHERE email = ?';
//     const values = [email];
//     db.get(
//         sql,
//         values,
//         function(err, row) {
//             if (err) return done(err);
//             return done(null, row && row.session_token, row);
//         }
//     );
// }
// const checkSessionToken = function(sessionToken, done) {
//     const sql = 'SELECT user_id FROM users WHERE session_token = ?';
//     const values = [sessionToken];
//     db.get(
//         sql,
//         values,
//         function(err, row) {
//             if (err) return done(err);
//             return done(null, row && row.user_id);
//         }
//     );
// }
const updateSessionToken = function(userId, sessionToken, done) {
    const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
    const values = [sessionToken, userId];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.changes);
        }
    );
};

const getBySessionToken = function(sessionToken, done) {
    const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE session_token = ?';
    const values = [sessionToken];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row);
        }
    );
};

const clearSessionToken = function(sessionToken, done) {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';
    const values = [sessionToken];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.changes);
        }
    );
};

module.exports = {
    insert,
    deleteById,
    updateById,
    findById,
    showAll,
    authenticateUser,
    getPinById,
    // checkHasLogin,
    // checkSessionToken,
    updateSessionToken,
    getBySessionToken,
    clearSessionToken
};