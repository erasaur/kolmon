Template.nav.helpers({
  currentRoute: function (route) {
    return KOL.helpers.get.currentRoute() === route ? 'active' : '';
  }
});
