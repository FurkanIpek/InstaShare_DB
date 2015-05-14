
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

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
  // images shared by the username and
  // its friends and then send them to the user
});

app.post('/upload', function(req, res) {
  console.log(req.files.image.originalFilename);
  console.log(req.files.image.path);
    fs.readFile(req.files.image.path, function (err, data){
    var dirname = __dirname + "\\public\\images";
    var newPath = dirname + req.files.image.originalFilename;
    fs.writeFile(newPath, data, function (err) {
    if(err){
    res.json({'response':"Error"});
    }else {
    res.json({'response':"Saved"});     
}
});
});
});

app.get('/getPhoto/:file', function (req, res) {
  var file = req.params.file;
  var directory = __dirname + "\\public\\images\\" + "\\" + file;
  var img = fs.readFileSync(directory);
  
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

var terminateServer=function(){
  httpserver.close();
  console.log("Server terminated!");
  process.exit();
};
process.on('SIGTERM',terminateServer);
process.on('SIGINT',terminateServer);