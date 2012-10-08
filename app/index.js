var express = require('express'),
    http = require('http'),
    mw = require('./middleware'),
    routes = require('./routes');

function App() {
  this.app = null;
  this.server = null;
}

App.prototype.start = function() {
  this.app = express();
  this.server = http.createServer(this.app);

  this.configure();
  this.listen(3000);

  return this.server;
}

App.prototype.configure = function() {
  (function(app) {
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
  })(this.app);
}

App.prototype.listen = function(port) {
  this.server.listen(port)

  console.log('Server listening on port ' + port);

  this.app.get('/', routes.index);
}

App.prototype.stop = function() {
  console.log('Shutting down server')
  this.server.close();
}

var app = new App();

app.start();
