angular.module('app.services', [])

.factory('servicesFactory', function ($http, $location) {

  var signin = function (user, roomname) {
    var data = {
      user: user,
      roomname: roomname
    }
    return $http({
      method: 'POST',
      url: '/signin',
      data: data
    })
    .then(function (res) {
      return res.data;
    });
  };

  var signout = function () {
    $location.path('/signin');
  };

  return {
    signin: signin,
    signout: signout
  };
});