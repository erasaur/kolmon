var helpers = KOL.helpers;
var Maps = KOL.Maps;


Template.mapEditAllMaps.onRendered(function() {
  this._worldId = helpers.get.currentParams().worldId;
  this._mapsWithWorldId = Maps.find({worldId: this._worldId}).fetch();
});

Template.mapEditAllMaps.helpers({
  maps: function() {
    return Maps.find({worldId: helpers.get.currentParams().worldId}).fetch();
  }
});