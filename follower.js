function assign(target, additions) {
  Object.keys(additions).forEach(function (key) {
    target[key] = additions[key];
  });
  return target;
}

/**
 *
 */

function FollowerObject() {
  this.initialize();
}
var followerProto = {};

followerProto.initialize = function initialize() {
  var channel = new BroadcastChannel('spike');
  channel.addEventListener('message', function(evt) {
    console.info('follower message event', evt.data, evt.timeStamp);
  });
  this.channel = channel;
};

followerProto.sendCommand = function sendCommand(name, data) {

};

followerProto.receiveCommand = function receiveCommand(data) {

};

assign(FollowerObject.prototype, followerProto);

/**
 *
 */

var followerObject = new FollowerObject();
followerObject.sendCommand('register', {
  now: performance.now()
});