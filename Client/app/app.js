angular.module("app", [
  "timer",
  "app.auth",
  "app.race",
  "ngRoute"
  ])

.config(function($routeProvider){
  $routeProvider
      .when('/signin', {
        templateUrl: '../auth/signin.html',
        controller: 'AuthController'
      })

      .when('/raceView/:roomId/:userId', {
        templateUrl: '../race/race.html',
        controller: 'raceController'
      })
      .otherwise({
        redirectTo: '/signin'
      }); 
});

