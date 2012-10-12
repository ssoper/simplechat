var redis = require('redis');

function Chat() {
  var client = redis.createClient();
  var getScore = function(user) {
    var normalized = user.replace(/\s/g, '').toLowerCase();
    var score = 0;
    for (var i=0; i < normalized.length; i++) {
      score += normalized.charCodeAt(i);
    }

    return score;
  }

  this.join = function(user, room, cb) {
    client.zadd(room, getScore(user), user, function(err) {
      if (err)
        return cb(err);

      client.zrank(room, user, function(err, index) {
        if (err)
          return cb(err);

        client.publish(room, JSON.stringify({ type: 'joined', payload: { user: user, index: index }}), function(err) {
          if (err)
            return cb(err);

          client.zrange(room, 0, -1, function(err, users) {
            if (err)
              return cb(err);
            return cb(null, { users: users, room: room });
          });
        });
      });
    });    
  }

  this.sendMessage = function(user, room, message, cb) {
    var data = {
      type: 'messaged',
      payload: { 
        user: user,
        createdAt: new Date(),
        message: message
      }
    };

    client.publish(room, JSON.stringify(data), function(err, result) {
      if (cb) {
        if (err)
          return cb(err);
        return cb(null, result);
      }
    });
  }

  this.leave = function(user, room, cb) {
    client.zrank(room, user, function(err, index) {
      if (err)
        return cb(err);

      var data = { type: 'exited', payload: { user: user, index: index }};
      client.publish(room, JSON.stringify(data), function(err) {
        if (err)
          return cb(err);

        client.zrem(room, user, function(err, done) {
          if (err)
            return cb(err);
          return cb(null, done);
        });
      });
    });
  }
}

module.exports = new Chat();