function assign(target, additions) {
  Object.keys(additions).forEach(function (key) {
    target[key] = additions[key];
  });
  return target;
}



function signature(fn) {
  var args = fn.toString().match('function[^(]*\\(([^)]*)\\)');
  if (!args || !args[1].trim()) { return []; }
  return args[1].split(',').map(function(a){ return a.trim(); });
}

var signatures = {};
function registerCommand(commandName, command) {
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      command = arguments[0];
      commandName = command.name;
    }
    else {
      command = commands[arguments[0]];
    }
  }
  else if (typeof command !== 'function') {
    command = commands[commandName];
  }
  signatures[commandName] = signature(command);
}




var commands = {};
commands.register = function register(sent) {
  console.info('register sent %s', sent);
};
commands.heartbeat = function heartbeat(index, totalJSHeapSize, usedJSHeapSize, sent) {
  console.log('follower heartbeat command');
  window.updateSVG('f' + window.location.search[1], index);
};


Object.keys(commands).forEach(registerCommand);




/**
 *
 */

var clientMixin = {};
clientMixin.initializeClient = function initializeClient() {
  var channel = new BroadcastChannel('spike');
  var follower = this;
  var commandArgs

  channel.addEventListener('message', function(evt) {
    console.info('follower broadcast channel message event', evt.data.command, evt.data.type);
    var eventId = evt.data.eventId;

    var commandName = evt.data.command;
    var command = commands[commandName];

    if (typeof command !== 'function') {
      return;
    }

    if (!signatures[commandName]) {
      return;
    }

    commandArgs = signatures[commandName].map(function(argName) {
      return evt.data.payload[argName];
    });

    command.apply(follower, commandArgs);
  });
  this.channel = channel;
};


/**
 *
 */

function FollowerObject() {
  this.initializeClient();
}
assign(FollowerObject.prototype, clientMixin);

var followerObject = new FollowerObject();