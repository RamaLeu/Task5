var createError = require('http-errors');
var express = require('express');
var path = require('path');
const db = require('./utils/db')
require('dotenv').config()
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var webRouter = require('./routes/web');

var app = express();
app.use(express.json())
const cors = require('cors');
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1',  express.urlencoded({ extended: true }),  apiRouter);
app.use('/',  express.urlencoded({ extended: true }),  webRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// var allowCrossDomain = function(req, res, next) {
// res.header('Access-Control-Allow-Origin', '*');
// res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
// res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
// // intercept OPTIONS method
// if ('OPTIONS' == req.method) {
// res.sendStatus(200);
// } else {
// next();
// }
// };

// app.use(allowCrossDomain);
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

try{
  db.connect()
  console.log('DB connection successful!')
}catch(err){
  console.log('Connection to DB failed')
}
module.exports = app;
