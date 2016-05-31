angular.module("app", [
  "timer",
  "app.auth",
  "app.services",
  "ngRoute"
  ])

.controller("AppController", function($scope, $timeout){
  $scope.countdownTime = 1;
  $scope.timerRunning = true;
  $scope.racerMoves = {};
    
  $scope.startTimer = function (){
    $scope.$broadcast('timer-start');
    $scope.timerRunning = true;

    for (var racer in $scope.racerMoves) {
      animateMovement(racer, $scope.racerMoves[racer]);
    }

    $('.container').css({'animation':'backgroundScroll 15s linear infinite'});
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
    $scope.racerMoves = calculateMoves($scope.countdownTime);
  };
  
  $scope.countdownComplete = function () {
    var winner = null;

    $('.trex').each(function() {
      if (!winner || $(this).css('left') > winner.css('left')) {
        winner = $(this);
      }
    });

    winner.css('border', '5px red solid');
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

function animateMovement(racer, moves) {
  moves.forEach(function(move) {
    $('.' + racer).animate({'left':'+=' + move.distance + '%'}, {
      duration: move.time
    });
  });
}

var calculateMoves = function(time) {
  var moves = {};
  time = time * 1000;

  $('.trex').each(function() {
    var racerTime = 0, move;
    moves[this.classList[1]] = [];

    for (var i = 0; i < 95; i++) {
      moves[this.classList[1]].push({time:time / 100, distance: 1});
    }
  });

  var winner = $('.trex')[Math.floor(Math.random() * $('.trex').length)].classList[1];

  for (racer in moves) {
    if (racer !== winner) {
      var randomMoves = new Array(Math.floor(Math.random() * 20));
      for (var i = 0; i < randomMoves.length; i++) {
        var rnd = Math.floor(Math.random() * moves[racer].length);
        moves[racer][rnd].distance = 0;
      }
    }
  }

  return moves;
}



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




