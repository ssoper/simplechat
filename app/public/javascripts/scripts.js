document.addEventListener('DOMContentLoaded', function() {
  var socket = io.connect('http://localhost');
  var room = 'tenforward';

  socket.emit('join', { room: room, user: 'User_' + parseInt(Math.random()*1000) });
  
  socket.on('joined', function(data) {
    var ul = document.querySelector('.chat.users ul');
    
    var li = function(user, single) {
      var li = document.createElement('li');
      li.id = user;
      var content = document.createTextNode(user);
      li.appendChild(content);

      if (single) {
        li.addClass('joining');
        setTimeout(function() {
          li.removeClass('joining');
        }, 5000);
      }

      return li;
    };

    if (data.user) {
      if (data.index == ul.childNodes.length) {
        ul.appendChild(li(data.user, true));
      } else {
        ul.insertBefore(li(data.user, true), ul.childNodes[data.index]);
      }
    } else if (data.users) {
      data.users.forEach(function(user) {
        ul.appendChild(li(user));        
      });
    }
  });

  socket.on('exited', function(data) {
    var ul = document.querySelector('.chat.users ul');
    var li = ul.querySelector('#' + data.user);
    li.addClass('leaving');
    setTimeout(function() {
      ul.removeChild(li);
    }, 5000);
  });

  socket.on('messaged', function(data) {
    var createdAt = moment(data.createdAt).format('hh:mm:ssa');
    var createdAtSpan = document.createElement('span');
    createdAtSpan.addClass('created_at');
    createdAtSpan.appendChild(document.createTextNode(createdAt));

    var userSpan = document.createElement('span');
    userSpan.addClass('user');
    userSpan.appendChild(document.createTextNode(' ' + data.user));

    var messageSpan = document.createElement('span');
    messageSpan.addClass('message')
    messageSpan.appendChild(document.createTextNode(':'));
    if (data.replyTo) {
      var replyToSpan = document.createElement('span');
      replyToSpan.addClass('replyTo');
      replyToSpan.appendChild(document.createTextNode(' ' + data.replyTo));
      messageSpan.appendChild(replyToSpan);
    }

    var parseMedia = function(message, cb) {
      var total = message.split(' ').length;
      var nodes = [];
      var done = function(media) {
        if (media)
          nodes.push(media);
        if (total == 0)
          cb(nodes);
      }

      message.split(' ').forEach(function(word) {
        if (word.match(/\.(png|jpg|jpeg|gif)$/)) {
          var img = $('<img>');
          img.attr('src', word).load(function() {
            total--;
            done({ media: img, width: img[0].naturalWidth, height: img[0].naturalHeight });
          });
        } else {
          total--;
          done();
        }
      });
    }

    var parseLinks = function(message) {
      return _.map(message.split(' '), function(word) {
        if (word.match(/^http:\/\//)) {
          var node = document.createElement('a');
          node.setAttribute('href', word);
          node.setAttribute('target', '_blank');
          node.appendChild(document.createTextNode(word));
          return node;
        } else {
          return document.createTextNode(word);
        }
      });
    };

    if (data.message.match(/\n/)) {
      var count = 0;
      data.message.split('\n').forEach(function(msg) {
        if (count == 0) {
          messageSpan.appendChild(document.createTextNode(' '));
        }
        messageSpan.appendChild(document.createTextNode(msg));
        messageSpan.appendChild(document.createElement('br'));
        count++;
      });
    } else {
      parseLinks(data.message).forEach(function(node) {
        messageSpan.appendChild(document.createTextNode(' '));
        messageSpan.appendChild(node);
      });
    }

    var p = document.createElement('p');
    p.appendChild(createdAtSpan);
    p.appendChild(userSpan);
    p.appendChild(messageSpan);

    var chat = $('.chat.display');
    chat.append(p);
    chat[0].scrollTop = chat[0].scrollHeight;

    parseMedia(data.message, function(media) {
      var height = 0;
      media.forEach(function(item) {
        chat.append(item.media);
        height += item.height;
      });
      chat[0].scrollTop += height;
    });
  });

  var input = document.querySelector('.chat.entry input:last-child');
  input.focus();

  document.querySelector('.chat.display').addEventListener('DOMSubtreeModified', function() {
    var chat = document.querySelector('.chat.display');
    chat.scrollTop = chat.scrollHeight;
  });

  document.addEventListener('keydown', function(evt) {
    if (input !== document.activeElement)
      return false;

    var message = input.value.trim();

    if (evt.keyCode == 13) { // Submit
      if (message.length > 0) {
        socket.emit('sendMessage', { room: room, message: message });
      }
      input.value = '';
      evt.preventDefault();
      return false;
    } else if (evt.keyCode == 9) { // Tab autocomplete
      var suggested = document.querySelector('#suggestion').value;
      document.querySelector('#suggestion').value = '';
      input.value = suggested;
      evt.preventDefault();
      return false;
    } else if (message.length == 3) { // Partial
      socket.emit('partial', message);
      return false;
    } else if (message.length > 3 && 
               document.querySelector('#suggestion').value.length > 0 &&
               !document.querySelector('#suggestion').value.match(message)) {
      document.querySelector('#suggestion').value = '';
    }
  }, false);

  socket.on('autocomplete', function(cmd) {
    if (cmd) {
      document.querySelector('#suggestion').value = cmd;
    }
  });
});
