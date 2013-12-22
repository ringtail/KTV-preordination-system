
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , sqlite3 = require('sqlite3').verbose()
  , async = require('async')
  , db = new sqlite3.Database('./data.db');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
var io = require('socket.io').listen(server);




server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {

  async.map(['big-room','mid-room','small-room','biz-room'],query,function(err,results){
      
    socket.emit('news', results);
  
  })

  socket.on('order',function(data){
    update(data,1);
    socket.broadcast.emit('brodcast-order',data);
  })
  socket.on('delete',function(data){
    update(data,0);
  })

});


function query(name,callback){
  db.all('select * from ['+name+']',function(err,rows){
    callback(err,rows);
  })
}
function update(data,status){
  console.log(data);
  var string = 'UPDATE [' + data.type + '] SET [status] = ' + status + ',[content] = ' + data.chunk +' where [index] = ' + data.index;
  console.log(string);
  db.all('UPDATE [' + data.type + '] SET [status] = ' + status + ',[content] = "' + data.chunk +'" where [index] = ' + data.index,function(err,results){
    console.log(results);
  });
}
