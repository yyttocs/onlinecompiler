var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cons = require('consolidate');


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var compiler = require('./app/controller/compile')

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
//app.use('/users', users);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   console.log(err.message)

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.post('/compilecode' , function (req , res ) {
    
    var code = req.body.code;   
    var input = req.body.input;
    var inputRadio = req.body.inputRadio;
    var lang = req.body.lang;
    if((lang === "C") || (lang === "C++"))
    {        
        if(inputRadio === "true")
        {    
            var envData = { OS : "linux" , cmd : "gcc"};        
            compiler.compileCPPWithInput(envData , code ,input , function (data) {
                if(data.error)
                {
                    console.log('hello')
                    res.send(data.error);           
                }
                else
                {
                    console.log('hello')
                    res.send(data.output);
                    console.log(data.output)
                }
            });
       }
       else
       {
        
        var envData = { OS : "linux" , cmd : "gcc"};       
            compiler.compileCPP(envData , code , function (data) {
            if(data.error)
            {
                console.log('hello')
                res.send(data.error);
            }       
            else
            {
                console.log('hello')
                res.send(data.output);
                console.log(data.output)
            }
    
            });
       }
    }
    if(lang === "Java")
    {
        if(inputRadio === "true")
        {
            var envData = { OS : "linux" };     
            //console.log(code);
            compiler.compileJavaWithInput( envData , code , input ,function(data){
                res.send(data);
            });
        }
        else
        {
            var envData = { OS : "linux" };     
            //console.log(code);
            compiler.compileJava( envData , code , function(data){
                res.send(data);
            });

        }

    }
});

app.get('/fullStat' , function(req , res ){
    compiler.fullStat(function(data){
        res.send(data);
    });
});

module.exports = app;
