
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//var fs = require('fs');
var fs = require('fs-extra');
var formidable = require('formidable');
var util = require('util');
var multer  = require('multer');

var app = express();


app.use(express.bodyParser({uploadDir:'./uploads'}));

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

//app.get('/', routes.index);
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

// Create a new file in /public/images for each registered user
var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

// Routing
app.get('/',function(req,res){
   res.set('Content-Type','application/json'); 
   res.send({"code":300,"status":"Server up and running!"});
  
});


app.post('/upload/:username', function (req, res){
  //console.log(req.body);
  console.log(req.files);
  
  var ID = req.params.username;
  console.log(ID);
  
  var tmp_path = req.files.file.path;
  var target_path = './public/images/' + ID + "/" + req.files.file.name;
  
  console.log(tmp_path + '\n' + target_path);
  
  fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });
    
  DB.addImageURL(ID, target_path);
  
  res.send({'Response': true});
});


app.post('/login', function(req, res) {
  var ID   = req.body.username;
  var pass = req.body.password;
  
  // Following function also send corresponding answers to res
  DB.checkCredentials(ID, pass, req, res);
});


app.post('/register', function(req,res) {
  var ID   = req.body.username;
  var pass = req.body.password;
  
  // create an image directory for the user
  mkdirSync('./public/images/' + ID);
  
  // Following function also send corresponding answers to res
  DB.registerUser(ID, pass, req, res);
});


app.get('/getPhotos', function (req, res) {
     DB.getPhotos("",req,res);
});


app.get('/getPhotos/:username', function (req, res) {
     DB.getPhotos(req.params.username,req,res);
});


app.get('/public/images/:username/:image', function (req, res) {
  
  console.log(req.params.username + " " + req.params.image);
  // sendFile here doesn't work
   var URL = __dirname + "\\public\\images\\" + req.params.username + "\\" + req.params.image;
   
   console.log(URL);
   
   res.sendFile(URL);
});


var terminateServer=function(){
  httpserver.close();
  console.log("Server terminated!");
  process.exit();
};
process.on('SIGTERM',terminateServer);
process.on('SIGINT',terminateServer);