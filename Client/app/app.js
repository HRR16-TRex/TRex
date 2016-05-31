angular.module("app", [
  "timer",
  "app.auth",
  "app.services",
  "ngRoute"
  ])

.controller("AppController", function($scope, $timeout){
  $scope.countdownTime = 1;
  $scope.timerRunning = true;
    
  $scope.startTimer = function (){
    $scope.$broadcast('timer-start');
    $scope.timerRunning = true;
    $('.trex').each(function() {
      var racer = $(this);
      intervalIds.push(setInterval(function() { move(racer) }, 1000));
    });

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
  };
  
  $scope.countdownComplete = function () {
    var winner = null;
    for (var i=0; i < intervalIds.length; i++) {
      var racer = $($('.trex')[i]);
      if (!winner || racer.css('left') > winner.css('left')) {
        winner = racer;
      }
      clearInterval(intervalIds[i]);
    }
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

});

var intervalIds = [];

var move = function(racer) {
  var rndDistance = Math.floor(Math.random() * 50);
  var rndTime = Math.random() * 1000;
  animateMovement(racer, rndDistance, rndTime);
}

function animateMovement(racer, distance, timeframe) {
  racer.animate({'left':'+=' + distance}, {
    duration: timeframe
  });
}


