var Players = KOL.Players;
var constants = KOL.constants;

SyncedCron.config({
  // Log job run details to console
  log: false,

  // Use a custom logger function (defaults to Meteor's logging package)
  logger: null,

  // Name of collection to use for synchronisation and logging
  collectionName: 'cronHistory',

  // Default to using localTime
  utc: false,

  /*
    TTL in seconds for history records in collection to expire
    NOTE: Unset to remove expiry but ensure you remove the index from
    mongo by hand

    ALSO: SyncedCron can't use the `_ensureIndex` command to modify
    the TTL index. The best way to modify the default value of
    `collectionTTL` is to remove the index by hand (in the mongo shell
    run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
    project. SyncedCron will recreate the index with the updated TTL.
  */
  collectionTTL: 172800
});

Meteor.startup(function () {
  SyncedCron.add({
    name: 'Cleanup logged-out players',
    schedule: function (parser) {
      return parser.text('every ' + constants.CRON_CLEANUP_TIME + ' minutes');
    },
    job: function () {
      var intervalInMs = constants.CRON_CLEANUP_TIME * 60 * 1000;
      var expired = Date.now() - intervalInMs;

      console.log(Players.find({
        'worldId': { $ne: null }, 'lastUpdate': { $le: expired }
      }).count());

      Players.update({
        'worldId': { $ne: null }, 'lastUpdate': { $le: expired }
      }, {
        $unset: { 'worldId': '' }
      });
    }
  });
  SyncedCron.start();
});
