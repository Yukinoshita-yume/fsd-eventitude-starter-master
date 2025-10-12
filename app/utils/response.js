
module.exports = {
  responseMiddleware(req, res, next) {
    res.success = function (data, httpStatus) {
      if (httpStatus) res.status(httpStatus);
      return res.json(data);
    };
    res.fail = function (msg, httpStatus) {
      if (httpStatus) res.status(httpStatus);
      return res.json({ error_message: msg || 'Response failed' });
    };
    next();
  }
};
