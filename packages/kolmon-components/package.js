Package.describe({
  name: 'kolmon-components',
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

  api.use('kolmon-lib');

  api.addFiles('lib/renderer.js');
  api.addFiles('lib/timer.js');
  api.addFiles('lib/transition.js');
  api.addFiles('lib/map_editor.js')

  // must load before world
  api.addFiles('lib/player.js');
  api.addFiles('lib/map.js');

  api.addFiles('lib/world.js');
  api.addFiles('lib/game.js');
});
