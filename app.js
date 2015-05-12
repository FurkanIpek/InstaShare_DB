
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('env', 'development');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);



// Create server and host application    
var httpserver=http.createServer(app);
    httpserver.listen(app.get('port'),function(){
      console.log("Server running, port: "+app.get('port'));
      console.log("Dir: "+__dirname);
 });
 

// DB.js has required DB functions
// usage: DB.handle_database_request(req,res,query)
var DB = require('./DB.js');

// Routing
app.get('/',function(req,res){
   res.set('Content-Type','application/json'); 
   res.send({"code":300,"status":"Server up and running!"});
  
});

app.get('/login/:username/:password', function(req, res) {
  var ID   = req.params.username;
  var pass = req.params.password;
  
  // Following function also send corresponding answers to res
  DB.checkCredentials(ID, pass, req, res);
});

app.get('/register/:username/:password', function(req,res) {
  var ID   = req.params.username;
  var pass = req.params.password;
  
  // Following function also send corresponding answers to res
  DB.registerUser(ID, pass, req, res);
});

app.get('/getPhotos/:username', function (req, res) {
  // request should send username
  // function should find all of the
  // images share by the username and
  // its friends and then send them to the user
});

app.get('/addPhoto/:username', function (req, res) {
  // A user aded a photo
});

app.get('/friReqSend/:sender/:receiver', function (req, res) {
  // A user added another user as its friend
});

app.get('/friReqAccepted/:sender/:receiver', function (req, res) {
  // A user accepted friend request of another
});

var terminateServer=function(){
  httpserver.close();
  console.log("Server terminated!");
  process.exit();
}
process.on('SIGTERM',terminateServer);
process.on('SIGINT',terminateServer);