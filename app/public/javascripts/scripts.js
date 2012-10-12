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
    messageSpan.addClass('message');
    messageSpan.appendChild(document.createTextNode(': ' + data.message));

    var p = document.createElement('p');
    p.appendChild(createdAtSpan);
    p.appendChild(userSpan);
    p.appendChild(messageSpan);

    document.querySelector('.chat.display').appendChild(p);
  });

  var input = document.querySelector('.chat.entry input');
  input.focus();

  document.querySelector('.chat.entry form').addEventListener('submit', function(evt) {
    var message = input.value
    if (message.length > 0) {
      socket.emit('sendMessage', { room: room, message: message });
    }
    input.value = '';
    evt.preventDefault();
    return false;
  }, false);
});
