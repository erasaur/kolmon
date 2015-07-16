var Players = KOL.Players;
var constants = KOL.constants;

Meteor.methods({
  setPosition: function (x, y) {
    check([x, y], [Number]);

    // manually validate x and y, so we don't have to validate entire doc with ss
    if (x < 0 || x > constants.CANVAS_WIDTH || y < 0 || y > constants.CANVAS_HEIGHT) {
      return;
    }

    Players.update({ 'userId': this.userId }, {
      $set: {
        'x': x,
        'y': y,
        'moving': false,
        'startTime': null
      }
    }, { validate: false });
  },
  setDirection: function (direction, startTime) {
    check([direction, startTime], [Number]);

    // manually validate direction, so we don't have to validate entire doc with ss
    if (direction < 0 || direction > 4) {
      return;
    }

    Players.update({ 'userId': this.userId }, {
      $set: {
        'direction': direction,
        'startTime': startTime,
        'moving': true
      }
    }, { validate: false });
  }
});
