angular.module('app.auth', [])

.controller('AuthController', function ($scope, $location) {
  $scope.username = '';

  $scope.racename = '';

  $scope.ctrlSignIn = function () {
    $location.path('/raceView/' + $scope.racename + '/' + $scope.username);
  };

});