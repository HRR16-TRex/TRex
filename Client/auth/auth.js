angular.module('app.auth', [])

.controller('AuthController', function ($scope, $location, Auth) {
  $scope.user = {};

  $scope.signin = function () {
    Auth.signin($scope.user)
      .then(function () {
        $location.path('/');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function () {
        $location.path('/');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
});