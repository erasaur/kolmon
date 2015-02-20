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
  services: {
    type: Object,
    blackbox: true
  },
  bag: {
    type: String
  },
  pokemon: { // all pokemon (PC)
    type: [String]
  },
  team: {
    type: [String],
    max: 4
  },
  game: {
    type: String
  },
  status: { // for user-status
    type: Object,
    blackbox: true,
    optional: true
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
