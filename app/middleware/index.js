function Middleware() {
  var object = {
    // cache: function(minutes) {
    //   if (env.development)
    //     minutes = 0;
    //   return function(req, res, next) {
    //     var maxAge = "public, max-age=" + (minutes*60);
    //     res.setHeader("Cache-Control", maxAge);
    //     next();
    //   }
    // },
    // 
    // findClient: function(req, res, next) {
    //   var clientId = req.cookies.clientId;
    // 
    //   if (!clientId) {
    //     if (!env.development) {
    //       return next(new errorTypes.Unauthorized);
    //     }
    // 
    //     // A valid clientId on development if you've run scripts/create_client_ids.js
    //     clientId = '5060ab29f85902000000000a';
    //   }
    // 
    //   colls.Client.valid(clientId, function(err, client) {
    //     if (client) {
    //       req.client = client;
    //       return next();
    //     }
    // 
    //     return next(new errorTypes.Unauthorized);
    //   });
    // },
  };

  // Object.defineProperty(object, 'mongoose', {
  //   get: function() {
  //     return _mongoose;
  //   },
  //   set: function(mongoose) {
  //     _mongoose = mongoose;
  //     schema.expose(colls, _mongoose);
  //   }
  // });
  // 
  // Object.defineProperty(object, 'parseQueryParams', {
  //   value: [object.parseSince, object.parseBefore, object.parseLimit, object.parseSort],
  //   writable: false
  // });

  return object;
}

module.exports = new Middleware();
