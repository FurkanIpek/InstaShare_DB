var mysql = require('mysql');

/**
 * Module dependencies.
 */

var crypto = require('crypto');
var rand = require('csprng');

//Connecting to database server
var connectionConfig={
    'host':'localhost',
    'database':'instashare',
    'user':'root',
    'password':'root',
    'connectionLimit':100
};    
var connectionPool=mysql.createPool(connectionConfig);

// functions under module.exports can be seen
// outside of this file, i.e. when require('DB')
// is assigned to a variable, aVariable.handle_database_request(...)
// invokes the method written in this file.
module.exports =
{
    
  checkCredentials: function(username, password, req, res) {
    
    connectionPool.getConnection(function(err,connection) {
      
       if (err) {
         connection.release();
         res.json({"code" : 400, "status" : "Error accessing database!"});
         return;
         }
    

        console.log('connected as id ' + connection.threadId);
        
        var query = "SELECT * FROM users WHERE username=?";
        
        connection.query(query, username, function(err, rows, fields) {
      	  connection.release();
          
      	  if ( !err && rows.length > 0 ) {
            
            var temp = rows[0].salt;
            var hash_db = rows[0].password;
            var id = rows[0].token;
            var newpass = temp + password;
            var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
            console.log(hashed_password);
            
            if ( hash_db == hashed_password ) {
              res.send({'loginSuccess' : true});
              return;
            }
      	  }
          
    	    res.json({"code" : 600, "status" : "Wrong credentials!"});
          
        });
      });   
    },
    
    registerUser: function (username, password, req, res) {
      
      connectionPool.getConnection(function(err,connection) {
      
       if (err) {
         connection.release();
         res.json({"code" : 400, "status" : "Error accessing database!"});
         return;
         }
    

        console.log('connected as id ' + connection.threadId);
        
        var temp = rand(160, 36);
        var newpass = temp + password;
        var token = crypto.createHash('sha512').update(username + rand).digest("hex");
        var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
        
        var data  = {username:username, password: hashed_password, token:token, username:username, salt:temp};
      
        var query = "INSERT INTO users SET ?";
        
        connection.query(query, data, function(err, rows, fields) {
      	  connection.release();
          
      	  if ( !err ) {
            res.send({'registered' : true});
            return;
      	  }
          
    	    res.json({"code" : 600, "status" : "Register failed!"});
          
        });
      });   
    },
    
  addImageURL: function (ID, path) {
      
      connectionPool.getConnection(function(err,connection) {
      
       if (err) {
         connection.release();
         res.json({"code" : 400, "status" : "Error accessing database!"});
         return;
         }

        console.log('connected as id ' + connection.threadId);
        
        var userIDquery = 'SELECT id FROM users WHERE username = ' + connection.escape(ID);
        var user_id = 0;
        
        connection.query(userIDquery, function(err, rows, fields) {
          
      	  if ( !err ) {
            user_id = rows[0].id;
            
            var query = 'INSERT INTO images SET id = ' + connection.escape(user_id) + ', url = ' + connection.escape(path);
            
            console.log("\n\n" + userIDquery + "\n" + query);
        
            connection.query(query, function(err, rows, fields) {
            	  connection.release();
                
            	  if ( !err ) {
                  console.log("Inserted");
                  return;
            	  }
            
            });
          }
          
        });
    });
  }
};