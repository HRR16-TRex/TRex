angular.module('app.auth', [])

.controller('AuthController', function ($scope, $location, servicesFactory) {
  $scope.user = {};

  $scope.roomname = '';

  $scope.signIn = function () {
    servicesFactory.factorySignIn();
  };

  // $scope.signup = function () {
  //   Auth.signup($scope.user)
  //     .then(function () {
  //       $location.path('/');
  //     })
  //     .catch(function (error) {
  //       console.error(error);
  //     });
  // };
});