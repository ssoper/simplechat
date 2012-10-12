var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    redis = require('redis'),
    async = require('async'),
    io = require('socket.io').listen(server),
    mw = require('./middleware'),
    routes = require('./routes'),
    chat = require('./lib/chat')

function App() {

}

App.prototype.start = function() {
  this.configure();
  this.listen(3000);
}

App.prototype.configure = function() {
  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
  });
}

App.prototype.listen = function(port) {
  server.listen(port)

  console.log('Server listening on port ' + port);

  app.get('/', routes.index);
  io.sockets.on('connection', function(socket) {
    var pubsub = redis.createClient();
    var user, rooms = [];

    socket.on('join', function(data) {
      rooms.push(data.room);
      user = data.user;

      chat.join(data.user, data.room, function(err, result) {
        if (err)
          return socket.emit('error', err);

        pubsub.subscribe(result.room, function(err) {
          socket.emit('joined', result);
        });
      });
    });

    pubsub.on('message', function(room, encoded) {
      var data = JSON.parse(encoded);
      switch (data.type) {
        case 'messaged':
          socket.emit('messaged', data.payload);
          break;
        case 'joined':
          socket.emit('joined', data.payload);
          break;
        case 'exited':
          socket.emit('exited', data.payload);
          break;
      }
    });

    socket.on('sendMessage', function(data) {
      chat.sendMessage(user, data.room, data.message);
    });

    socket.on('disconnect', function() {
      async.forEach(rooms, function(room, cb) {
        chat.leave(user, room, function(err, result) {
          pubsub.unsubscribe(room, function(err) {
            cb();
          });
        });
      }, function(err) {
        pubsub.quit();
      });
    });
  });
}

App.prototype.stop = function() {
  console.log('Shutting down server')
  server.close();
}

var appInstance = new App();

appInstance.start();
