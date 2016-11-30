function assign(target, additions) {
  Object.keys(additions).forEach(function (key) {
    target[key] = additions[key];
  });
  return target;
}

/**
 *
 */


var controllerMixin = {};
controllerMixin.initializeController = function initializeController() {
  this.worker = new Worker('web-worker.js');;
};

// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
controllerMixin.sendCommand = function sendCommand(name, payload, callback) {
  var worker = this.worker;
  var message = {
    command: name,
    payload: payload
  };

  function makeListener(id, done) {
    function eventListener(evt) {
      if (evt.data.eventId !== id) return;
      done(null, evt.data.payload);
      worker.removeEventListener('message', eventListener);
    };
    return eventListener;
  }

  if (callback) {
    message.eventId = auid();
    worker.addEventListener('message', makeListener(message.eventId, callback));
  }

  worker.postMessage(message);
};

/**
 *
 */


function ControllerObject() {
  this.initializeController();
}
assign(ControllerObject.prototype, controllerMixin);

var controllerObject = new ControllerObject();

var _c = 0;
var _fullfilled = 0;
var _s = 10;
var _ts = 0;
var _af;

var _used = document.getElementById('js-heap-size--used');
_used.style.width = ((performance.memory.totalJSHeapSize / performance.memory.usedJSHeapSize) * 1) + '%';

var _f3 = window.open('follower.html?3', 'f3', 'width=300,height=300,location=no');

function loop(timestamp) {
  if (timestamp - _ts > (_s * 1000)) {
    console.info('%s calls per sec, %s% fullfilled', _c / _s, (_fullfilled / _c) * 100);
    return cancelAnimationFrame(_af);
  }

  _c++;
  window.updateSVG('c', _c);
  _used.style.width = ((performance.memory.totalJSHeapSize / performance.memory.usedJSHeapSize) * 1) + '%';
  controllerObject.sendCommand('heartbeat', {
    sent: performance.now(),
    index: _c,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    usedJSHeapSize: performance.memory.usedJSHeapSize
  }, function(err, payload) {
    _fullfilled++;
    _af = requestAnimationFrame(loop);
  });
}

function start() {
  _c = 0;
  _fullfilled = 0;
  _ts = performance.now();
  _af;

  loop();
}
document.getElementById('start').addEventListener('click', start);