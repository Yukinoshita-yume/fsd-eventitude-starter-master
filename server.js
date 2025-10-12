const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3333;

app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// CORS support
const allowCrossOriginRequests = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  } 
};
app.use(allowCrossOriginRequests);

// attach unified response helpers
const { responseMiddleware } = require('./app/utils/response');
app.use(responseMiddleware)

// routes
const indexRouter = require('./app/routes/index');
const userRouter = require('./app/routes/user');
const authRouter = require('./app/routes/auth');
const eventRouter = require('./app/routes/event');
const questionRouter = require('./app/routes/question');
const eventController = require('./app/controllers/eventController');
const optionalAuthMiddleware = require('./app/utils/jwt').optionalAuthMiddleware;

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/', authRouter);
app.use('/events', eventRouter);
app.use('/event', eventRouter);
app.use('/', questionRouter);
app.get('/search', optionalAuthMiddleware,eventController.search);

app.use(function (req, res, next) {
  res.status(404).json({ error_message: "Not Found" })
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({ error_message: err.message || 'Response failed' })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});