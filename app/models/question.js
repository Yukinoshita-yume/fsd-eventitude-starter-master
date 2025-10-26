const db = require('../../database');

const insert = function(question, done) {
    const sql = 'INSERT INTO questions (question, asked_by, event_id, votes) VALUES (?, ?, ?, 0)';
    const values = [question.question, question.asked_by, question.event_id];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.lastID);
        }
    );
};

const findById = function(questionId, done) {
    const sql = `SELECT q.*, u.first_name, u.last_name, u.user_id
                 FROM questions q
                 JOIN users u ON q.asked_by = u.user_id
                 WHERE q.question_id = ?`;
    const values = [questionId];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row);
        }
    );
};

const deleteById = function(questionId, done) {
    const sql = 'DELETE FROM questions WHERE question_id = ?';
    const values = [questionId];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.changes);
        }
    );
};

const getByEventId = function(eventId, done) {
    const sql = `SELECT q.question_id, q.question, q.votes, 
                        u.user_id, u.first_name, u.last_name
                 FROM questions q
                 JOIN users u ON q.asked_by = u.user_id
                 WHERE q.event_id = ?
                 ORDER BY q.votes DESC, q.question_id ASC`;
    const values = [eventId];
    db.all(
        sql,
        values,
        function(err, rows) {
            if (err) return done(err);
            return done(null, rows);
        }
    );
};

const upvote = function(questionId, userId, done) {
    // 首先检查是否已经投票
    const checkSql = 'SELECT COUNT(*) as count FROM votes WHERE question_id = ? AND voter_id = ?';
    const checkValues = [questionId, userId];
    
    db.get(checkSql, checkValues, (err, row) => {
        if (err) return done(err);
        if (row.count > 0) {
            return done(new Error('Already voted'));
        }
        
        // 添加投票记录
        const voteSql = 'INSERT INTO votes (question_id, voter_id) VALUES (?, ?)';
        const voteValues = [questionId, userId];
        
        db.run(voteSql, voteValues, (err) => {
            if (err) return done(err);
            
            // 更新问题投票数
            const updateSql = 'UPDATE questions SET votes = votes + 1 WHERE question_id = ?';
            const updateValues = [questionId];
            
            db.run(updateSql, updateValues, (err) => {
                if (err) return done(err);
                return done(null, this.changes);
            });
        });
    });
};

const downvote = function(questionId, userId, done) {
    // 首先检查是否已经投票
    const checkSql = 'SELECT COUNT(*) as count FROM votes WHERE question_id = ? AND voter_id = ?';
    const checkValues = [questionId, userId];
    
    db.get(checkSql, checkValues, (err, row) => {
        if (err) return done(err);
        if (row.count > 0) {
            return done(new Error('Already voted'));
        }
        
        // 添加投票记录
        const voteSql = 'INSERT INTO votes (question_id, voter_id) VALUES (?, ?)';
        const voteValues = [questionId, userId];
        
        db.run(voteSql, voteValues, (err) => {
            if (err) return done(err);
            
            // 更新问题投票数
            const updateSql = 'UPDATE questions SET votes = votes - 1 WHERE question_id = ?';
            const updateValues = [questionId];
            
            db.run(updateSql, updateValues, (err) => {
                if (err) return done(err);
                return done(null, this.changes);
            });
        });
    });
};

const hasUserVoted = function(questionId, userId, done) {
    const sql = 'SELECT COUNT(*) as count FROM votes WHERE question_id = ? AND voter_id = ?';
    const values = [questionId, userId];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row.count > 0);
        }
    );
};

const getByUserId = function(userId, done) {
    const sql = `SELECT q.question_id, q.question, q.votes, q.event_id,
                        e.name as event_name
                 FROM questions q
                 JOIN events e ON q.event_id = e.event_id
                 WHERE q.asked_by = ?
                 ORDER BY q.question_id DESC`;
    const values = [userId];
    db.all(
        sql,
        values,
        function(err, rows) {
            if (err) return done(err);
            return done(null, rows);
        }
    );
};

module.exports = {
    insert,
    findById,
    deleteById,
    getByEventId,
    upvote,
    downvote,
    hasUserVoted,
    getByUserId
};
