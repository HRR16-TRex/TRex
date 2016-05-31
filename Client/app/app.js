angular.module("app", [
  "timer",
  "app.auth",
  "app.services",
  "app.race",
  "ngRoute"
  ])

.config(function($routeProvider){
  $routeProvider
      .when('/signin', {
        templateUrl: '../auth/signin.html',
        controller: 'AuthController'
      })
      //:id to be the roomname input by user
      .when('/raceView/:id', {
        templateUrl: '../race/race.html',
        controller: 'raceController'
      })
      .otherwise({
        redirectTo: '/signin'
      }); 
});  


