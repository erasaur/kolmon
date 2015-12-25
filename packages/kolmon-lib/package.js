Package.describe({
  name: 'kolmon-lib',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');

  api.use('aldeed:collection2');

  api.addFiles('lib.js');
  api.addFiles('lib/constants.js');
  api.addFiles('lib/helpers.js');
  api.addFiles('lib/utils.js');
  api.addFiles('lib/wrappers.js');

  api.addFiles('collections/bags.js');
  api.addFiles('collections/battles.js');
  api.addFiles('collections/maps.js');
  api.addFiles('collections/players.js');
  api.addFiles('collections/pokemon.js');
  api.addFiles('collections/users.js');
  api.addFiles('collections/worlds.js');

  api.export('KOL');
});
