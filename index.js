function assign(target, additions) {
  Object.keys(additions).forEach(function (key) {
    target[key] = additions[key];
  });
  return target;
}

/**
 *
 */


function ControllerObject() {
  this.initialize();
}
var controlProto = {};

controlProto.initialize = function initialize() {
  var worker = new Worker('web-worker.js');
  // worker.addEventListener('message', function(evt) {
  //   console.info('controller message event', evt.data.command, evt.data.type);
  // });
  this.worker = worker;
};

var _eventId = 0;
controlProto.sendCommand = function sendCommand(name, payload, callback) {
  var worker = this.worker;
  var data = {
    command: name,
    payload: payload
  };

  function makeListener(id, done) {
    function eventListener(evt) {
      if (evt.data.eventId !== id) return;
      console.info('callback listener (%s)', id, evt.data.payload);
      done(null, evt.data.payload);
      worker.removeEventListener('message', eventListener);
    };
    return eventListener;
  }

  if (callback) {
    _eventId++;
    data.eventId = _eventId;
    worker.addEventListener('message', makeListener(_eventId, callback));
  }

  worker.postMessage(data);
};

assign(ControllerObject.prototype, controlProto);

/**
 *
 */

var controllerObject = new ControllerObject();

var _c = 0;
var _fullfilled = 0;
var _s = 0;
var _af;
function loop(timestamp) {
  if (timestamp - _s > 1000) {
    console.info('%s calls per sec, %s fullfilled', _c, _fullfilled);
    return cancelAnimationFrame(_af);
  }

  _c++;
  console.group(_c);
  controllerObject.sendCommand('heartbeat', {
    sent: performance.now(),
    index: _c
  }, function(err, payload) {
    console.info('fullfilled', payload);
    _fullfilled++;
  });
  console.groupEnd();
  _af = requestAnimationFrame(loop);
}

function start() {
  _c = 0;
  _fullfilled = 0;
  _s = performance.now();
  _af;

  loop();
}
setTimeout(start, 1000);