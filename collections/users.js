Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  profile: { // public and editable
    type: Schema.UserProfile,
    optional: true
  },

  // game
  bagId: {
    type: String
  },
  pokemonIds: { // all pokemon (PC)
    type: [String],
    defaultValue: []
  },
  teamIds: {
    type: [String],
    defaultValue: [],
    max: 4
  },
  playerId: {
    type: String
  },

  // other
  status: { // for user-status
    type: Object,
    blackbox: true,
    optional: true
  },
  services: {
    type: Object,
    blackbox: true
  }
});

Meteor.users.attachSchema(Schema.User);
Meteor.users.deny({
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

