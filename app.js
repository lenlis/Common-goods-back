var createError = require('http-errors');
var cors = require('cors')
var express = require('express');
var path = require('path');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const errorMiddleware = require('./middlewares/error-middleware');


var app = express();
// app.use(cors({
//   credentials: true,
//   origin: process.env.CLIENT_URL
// }));
app.use(cors({origin: '*'}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(fileUpload({
  limits: {
      fileSize: 10000000, // Around 10MB
  },
  abortOnLimit: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(errorMiddleware);

app.use('/', require('./routes'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


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
