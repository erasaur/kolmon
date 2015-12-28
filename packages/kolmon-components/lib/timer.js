KOL.Timer = {
  timers: {},
  start: function (id, fn, delay) {
    if (this.timers[id]) this.stop(id);
    this.timers[id] = Meteor.setInterval(fn, delay);
  },
  stop: function (id) {
    var self = this;
    var stop = function stopTimer (id, timerId) {
      Meteor.clearInterval(timerId);
      delete self.timers[id];
    };
    if (typeof id === 'undefined') {
      _.each(this.timers, function (val, key) { stop(key, val); });
      return;
    }
    stop(id, this.timers[id]);
  }
};
