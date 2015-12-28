var Maps = KOL.Maps;

Meteor.methods({
  'updateMapRegions': function(mapId, newWalls, newPortals, newWild) {
    check(mapId, String);
    check(newWalls, [Object]);
    check(newPortals, [Object]);
    check(newWild, [Object]);

    Maps.update({_id: mapId },{
      $set: {
        walls: newWalls,
        portals: newPortals,
        wild: newWild
      }
    }, function(error, numAffected) {
      if(error) {
        console.log(error.message);
      }
      else {
        console.log('Map Saved to Server Successfully');
      }
    });
  }
});