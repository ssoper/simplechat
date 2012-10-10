var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    redis = require('redis'),
    async = require('async'),
    io = require('socket.io').listen(server),
    mw = require('./middleware'),
    routes = require('./routes');

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

  var getScore = function(username) {
    var normalized = username.replace(/\s/g, '').toLowerCase();
    var score = 0;
    for (var i=0; i < normalized.length; i++) {
      score += normalized.charCodeAt(i);
    }

    return score;
  }

  app.get('/', routes.index);
  io.sockets.on('connection', function(socket) {
    var pubsub = redis.createClient();
    var client = redis.createClient();
    var user, rooms = [];

    socket.on('join', function(data) {
      client.zadd(data.room, getScore(data.user), data.user, function(err) {
        rooms.push(data.room);
        user = data.user;
        client.zrank(data.room, data.user, function(err, index) {
          client.publish(data.room, JSON.stringify({ type: 'joined', payload: { user: data.user, index: index }}), function(err) {
            pubsub.subscribe(data.room, function(err) {
              client.zrange(data.room, 0, -1, function(err, users) {
                socket.emit('joined', { users: users });
              });
            });
          });
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
      client.publish(data.room, { type: 'messaged', payload: data.message });
    });

    socket.on('disconnect', function() {
      async.forEach(rooms, function(room, cb) {
        pubsub.unsubscribe(room, function(err) {
          client.zrank(room, user, function(err, index) {
            client.publish(room, JSON.stringify({ type: 'exited', payload: { user: user, index: index }}), function(err) {
              client.zrem(room, user, function(err, done) {
                client.quit();
                pubsub.quit();
                cb();
              });
            });
          });
        });
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
