angular.module("app.race", [])
  
  .controller("raceController", function($scope, $timeout){
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