angular.module('app.auth', [])

.controller('AuthController', function ($scope, $location) {
  $scope.username = '';

  $scope.racename = '';

  $scope.ctrlSignIn = function () {
    // Upon submit of the signin form redirect to raceView using the racename and username
    $location.path('/raceView/' + $scope.racename + '/' + $scope.username);
  };

});