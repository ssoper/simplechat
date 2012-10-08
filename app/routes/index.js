function Routes() {

  var object = {
    index: function (req, res) {
      // Because we run on our EC2 as a non-sudo user, we must run on a port greater
      // than 1024 and use a proxy to forward packets from 80 to the real port.
      // var port = (_settings.host != 'localhost' && env.production) ? 80 : _settings.port;
      res.render('index');//, { host: _settings.host, port: port });
    }
  };

  return object;
}

module.exports = new Routes;
