require('dotenv').config();

const express = require('express');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');

const { jsonCompressorMiddleware } = require('@mkdierz/json-compressor');
const indexRouter = require('./src/routes');

const app = express();

app.use(logger('dev'));
app.use(jsonCompressorMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
