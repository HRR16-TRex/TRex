angular.module('app.auth', [])

.controller('AuthController', function ($scope, $location, servicesFactory) {
  $scope.username = '';

  $scope.racename = '';

  $scope.ctrlSignIn = function () {
    console.log("signIn on controller working");
    servicesFactory.factorySignIn($scope.username, $scope.racename)
    .then(function () {
      console.log('ctrlSignIn .then');
      // add something here
      $location.path('/raceView/' + $scope.racename + '/' + $scope.username);
    })
    .catch(function (error) {
      console.error(error);
    });
  };

});