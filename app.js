require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const wiki = require('./routes/wiki')
const catalogRouter = require('./routes/catalog')
const compression = require("compression")
const helmet = require("helmet")

var app = express();

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const RateLimit = require("express-rate-limit")
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20
})

main().catch((err) => console.log(err))
async function main() {
  await mongoose.connect(process.env.DB_LINK)
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression())
app.use(express.static(path.join(__dirname, "public")))
app.use(helmet.contentSecurityPolicy({directives:{ "script-src": ["self", "code.jquery.com", "cdn.jsdelivr.net"]}}))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wiki)
app.use('/catalog', catalogRouter)
app.use(limiter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
