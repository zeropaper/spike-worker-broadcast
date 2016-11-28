


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





var channel = new BroadcastChannel('spike');
channel.addEventListener('message', function(evt) {
  console.info('worker channel message event', evt.data.command, evt.data.type, evt.timeStamp);
});




var commands = {};
commands.register = function register(sent) {
  console.info('register sent %s', sent);
};
commands.heartbeat = function heartbeat(index, totalJSHeapSize, usedJSHeapSize, sent) {
  console.info('heartbeat %s sent %s', index, totalJSHeapSize, usedJSHeapSize, sent);
  channel.postMessage({
    command: 'heartbeat',
    payload: {
      sent: sent,
      index: index
    }
  });
  return 'boom ' + index;
};


Object.keys(commands).forEach(registerCommand);










var worker = this;
worker.addEventListener('message', function(evt) {
  console.info('worker message event', evt.data.command, evt.data.type);
  var eventId = evt.data.eventId;

  var commandName = evt.data.command;
  var command = commands[commandName];

  if (typeof command !== 'function') {
    return worker.postMessage({
      type: 'error',
      command: commandName,
      message: 'Unknown command "' + commandName + '"',
      eventId: eventId
    });
  }

  if (!signatures[commandName]) {
    return worker.postMessage({
      type: 'result',
      command: commandName,
      payload: command(evt.data),
      eventId: eventId
    });
  }

  var commandArgs = signatures[commandName].map(function(argName) {
    return evt.data.payload[argName];
  });

  var result = command.apply(worker, commandArgs);
  worker.postMessage({
    type: 'result',
    command: commandName,
    payload: result,
    eventId: eventId
  });
});
