Template.nav.helpers({
  currentPage: function (page) {
    return getCurrentRoute() === page ? 'active' : '';
  }
});