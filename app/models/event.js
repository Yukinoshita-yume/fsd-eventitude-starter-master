const db = require('../../database');

const insert = function(event, done) {
    const sql = 'INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [event.name, event.description, event.location, event.start, event.close_registration, event.max_attendees, event.creator_id];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.lastID);
        }
    );
};

const findById = function(eventId, done) {
    const sql = `SELECT e.*, u.first_name, u.last_name, u.email as creator_email
                 FROM events e 
                 JOIN users u ON e.creator_id = u.user_id 
                 WHERE e.event_id = ?`;
    const values = [eventId];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row);
        }
    );
};

// const updateById = function(eventId, event, done) {
//     const sql = 'UPDATE events SET name = ?, description = ?, location = ?, start_date = ?, close_registration = ?, max_attendees = ? WHERE event_id = ?';
//     const values = [event.name, event.description, event.location, event.start, event.close_registration, event.max_attendees, eventId];
//     db.run(
//         sql,
//         values,
//         function(err) {
//             if (err) return done(err);
//             return done(null, this.changes);
//         }
//     );
// };

const updateById = function(eventId, event, done) {
  const fields = {
    name: 'name',
    description: 'description',
    location: 'location',
    start: 'start_date',
    close_registration: 'close_registration',
    max_attendees: 'max_attendees'
  };

  // 动态生成 SET 子句
  const setClauses = [];
  const values = [];

  for (const [key, column] of Object.entries(fields)) {
    if (event[key] !== undefined) { // 仅当传入的字段存在时才更新
      setClauses.push(`${column} = ?`);
      values.push(event[key]);
    }
  }

  // 如果没有任何字段需要更新
  if (setClauses.length === 0) {
    return done(null, 0); // 返回0表示无修改
  }

  const sql = `UPDATE events SET ${setClauses.join(', ')} WHERE event_id = ?`;
  values.push(eventId);

  db.run(sql, values, function(err) {
    if (err) return done(err);
    return done(null, this.changes);
  });
};


const deleteById = function(eventId, done) {
    const sql = 'UPDATE events SET close_registration = -1 WHERE event_id = ?';
    const values = [eventId];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.changes);
        }
    );
};

const addAttendee = function(eventId, userId, done) {
    const sql = 'INSERT INTO attendees (event_id, user_id) VALUES (?, ?)';
    const values = [eventId, userId];
    db.run(
        sql,
        values,
        function(err) {
            if (err) return done(err);
            return done(null, this.changes);
        }
    );
};

const getAttendees = function(eventId, done) {
    const sql = `SELECT u.user_id, u.first_name, u.last_name, u.email
                 FROM attendees a
                 JOIN users u ON a.user_id = u.user_id
                 WHERE a.event_id = ?`;
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

const getAttendeeCount = function(eventId, done) {
    const sql = 'SELECT COUNT(*) as count FROM attendees WHERE event_id = ?';
    const values = [eventId];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row.count);
        }
    );
};

const isUserAttending = function(eventId, userId, done) {
    const sql = 'SELECT COUNT(*) as count FROM attendees WHERE event_id = ? AND user_id = ?';
    const values = [eventId, userId];
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row.count > 0);
        }
    );
};

const searchEvents = function(filters, done) {
    let sql = `SELECT e.*, u.first_name, u.last_name, u.email as creator_email
               FROM events e 
               JOIN users u ON e.creator_id = u.user_id 
               WHERE 1=1`;
    const values = [];
    
    if (filters.q) {
        sql += ' AND e.name LIKE ?';
        values.push(`%${filters.q}%`);
    }
    
    if (filters.status) {
        const now = Date.now();
        switch (filters.status) {
            case 'MY_EVENTS':
                sql += ' AND e.creator_id = ?';
                values.push(filters.userId);
                break;
            case 'ATTENDING':
                sql += ' AND e.event_id IN (SELECT event_id FROM attendees WHERE user_id = ?) AND e.creator_id != ?';
                values.push(filters.userId, filters.userId);
                break;
            case 'OPEN':
                sql += ' AND e.close_registration > ? AND e.close_registration != -1';
                values.push(now);
                break;
            case 'ARCHIVE':
                sql += ' AND e.close_registration < ?';
                values.push(now);
                break;
        }
    }
    
    sql += ' ORDER BY e.start_date ASC';
    
    if (filters.limit) {
        sql += ' LIMIT ?';
        values.push(filters.limit);
    }
    
    if (filters.offset) {
        sql += ' OFFSET ?';
        values.push(filters.offset);
    }
    
    db.all(
        sql,
        values,
        function(err, rows) {
            if (err) return done(err);
            return done(null, rows);
        }
    );
};

const countEvents = function(filters, done) {
    let sql = `SELECT COUNT(*) as count
               FROM events e 
               JOIN users u ON e.creator_id = u.user_id 
               WHERE 1=1`;
    const values = [];
    
    if (filters.q) {
        sql += ' AND e.name LIKE ?';
        values.push(`%${filters.q}%`);
    }
    
    if (filters.status) {
        const now = Date.now();
        switch (filters.status) {
            case 'MY_EVENTS':
                sql += ' AND e.creator_id = ?';
                values.push(filters.userId);
                break;
            case 'ATTENDING':
                sql += ' AND e.event_id IN (SELECT event_id FROM attendees WHERE user_id = ?) AND e.creator_id != ?';
                values.push(filters.userId, filters.userId);
                break;
            case 'OPEN':
                sql += ' AND e.close_registration > ? AND e.close_registration != -1';
                values.push(now);
                break;
            case 'ARCHIVE':
                sql += ' AND e.close_registration < ?';
                values.push(now);
                break;
        }
    }
    
    db.get(
        sql,
        values,
        function(err, row) {
            if (err) return done(err);
            return done(null, row ? row.count : 0);
        }
    );
};

module.exports = {
    insert,
    findById,
    updateById,
    deleteById,
    addAttendee,
    getAttendees,
    getAttendeeCount,
    isUserAttending,
    searchEvents,
    countEvents
};
