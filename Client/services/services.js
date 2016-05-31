angular.module('app.services', [])

.factory('Auth', function ($http, $location) {
  var signin = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  var signout = function () {
    $location.path('/signin');
  };

  return {
    signin: signin,
    signup: signup,
    signout: signout
  };
});