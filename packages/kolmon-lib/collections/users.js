var schemas = KOL.schemas;
var helpers = KOL.helpers;

schemas.UserProfile = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    optional: true
  }
});

schemas.User = new SimpleSchema({
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
    type: schemas.UserProfile,
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
  roles: {
    type: [String],
    defaultValue: []
  },
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

var Users = KOL.Users = Meteor.users;
Users.attachSchema(schemas.User);
Users.deny(helpers.denyAll);
