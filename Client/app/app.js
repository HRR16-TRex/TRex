angular.module("app", [
  "timer",
  "app.auth",
  "app.services",
  "ngRoute"
  ])

.controller("AppController", function($scope, $timeout){
  $scope.countdownTime = 1;
  console.log($scope.countdownTime);
  $scope.timerRunning = true;
    
  $scope.startTimer = function (){
    $scope.$broadcast('timer-start');
    $scope.timerRunning = true;
    move();
  };
            
  $scope.stopTimer = function (){
    $scope.$broadcast('timer-stop');
    $scope.timerRunning = false;
  };
            
  $scope.$on('timer-stopped', function (event, data){
    console.log('Timer Stopped - data = ', data);
  });
  
  var turnToSeconds = function (seconds, minutes) {
    seconds = seconds || 0;
    minutes = minutes || 0;
    return Number(seconds)+Number((minutes*60));
  };
  
  $scope.setTimer = function (seconds, minutes) {
    $scope.countdownTime = turnToSeconds(seconds, minutes);
    $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownTime);
  };
  
  $scope.countdownComplete = function () {
    console.log('Countdown complete');
  };

})


.config(function($routeProvider){
  $routeProvider
      .when('/signin', {
        templateUrl: '../auth/signin.html',
        controller: 'AuthController'
      })
      .when('/signup', {
        templateUrl: '../auth/signup.html',
        controller: 'AuthController'
      })
      .otherwise({
        redirectTo: '/'
      });   

      // $httpProvider.interceptors.push('AttachTokens'); 
});

//   .factory('AttachTokens', function ($window) {
//   // this is an $httpInterceptor
//   // its job is to stop all out going request
//   // then look in local storage and find the user's token
//   // then add it to the header so the server can validate the request
//   var attach = {
//     request: function (object) {
//       var jwt = $window.localStorage.getItem('com.timer');
//       if (jwt) {
//         object.headers['x-access-token'] = jwt;
//       }
//       object.headers['Allow-Control-Allow-Origin'] = '*';
//       return object;
//     }
//   };
//   return attach;
// })
// .run(function ($rootScope, $location, Auth) {
//   // here inside the run phase of angular, our services and controllers
//   // have just been registered and our app is ready
//   // however, we want to make sure the user is authorized
//   // we listen for when angular is trying to change routes
//   // when it does change routes, we then look for the token in localstorage
//   // and send that token to the server to see if it is a real user or hasn't expired
//   // if it's not valid, we then redirect back to signin/signup
//   $rootScope.$on('$routeChangeStart', function (evt, next, current) {
//     if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
//       $location.path('/signin');
//     }
//   });
  