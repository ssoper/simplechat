document.addEventListener('DOMContentLoaded', function() {
  var socket = io.connect('http://localhost');
  var room = 'tenforward';
  socket.emit('join', { room: room, user: 'User_' + parseInt(Math.random()*1000) });
  
  socket.on('joined', function(data) {
    var ul = document.querySelector('.chat.users ul');
    
    var li = function(user) {
      var li = document.createElement('li');
      li.id = user;
      var content = document.createTextNode(user);
      li.appendChild(content);
      return li;
    };
    
    if (data.user) {
      if (data.index == ul.childNodes.length) {
        ul.appendChild(li(data.user));
      } else {
        ul.insertBefore(li(data.user), ul.childNodes[data.index]);
      }
    } else if (data.users) {
      data.users.forEach(function(user) {
        ul.appendChild(li(user));        
      });
    }
  });
  
  socket.on('exited', function(data) {
    var ul = document.querySelector('.chat.users ul');
    ul.removeChild(ul.childNodes[data.index]);
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
