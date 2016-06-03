angular.module("app.race", ['ngRoute'])
  
  .controller("raceController", function($scope, $timeout, $location, $routeParams){
      $scope.countdownTime = 1;
      $scope.timerRunning = true;
      $scope.racerChosen = false;
        
      $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
        socket.emit('startRace', true);
        $('#raceView').css({'animation':'backgroundScroll 15s linear infinite'});
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
        
        var racers = [];
        $('.trex').each(function() {
          racers.push(this.classList[1]);
        });
        
        // passes the timer and an array of all the racers and their unique class to the server
        socket.emit('generateRaceData', $scope.countdownTime, racers);
      };
      
      $scope.countdownComplete = function () {
        var winner = null;

        $('.trex').each(function() {
          if (!winner || Number($(this).css('left').replace('px','')) > Number(winner.css('left').replace('px',''))) {
            winner = $(this);
          }
        });

        winner.css('border', '5px red solid');
        console.log('Countdown complete');
      };
      
      
      // when a player joins, we can send all the players (emit) in the global variable
      // for the room back to the client
      // so you'll get an array of users with the key {username: racerChosen}
      
      // How to access the user and room from the url
      // var username = $routeParams.userId;
      // var roomname = $routeParams.roomId;
      
      // Provides the options for the different racers in the drop down
      $scope.racerChoices=['red', 'blue', 'green'];
      
      $scope.sendChatMessage= function(message) {
        var userMessage = {
          user: $routeParams.userId,
          message: message
        };
        
        $scope.messageList.push(userMessage);
        // TODO actually send this message to socket.io
        console.log(userMessage);
      };
      
      $scope.chooseRacer = function(racer) {
        // TODO actually send the racer and the user to socket io
        var user= {
          user: $routeParams.userId,
          racerChoice: racer
        };
        
        $scope.userList.push(user);
        
        // This hides the form and displays the users choice
        $scope.racerChosen = true;
      };
      
      $scope.userList = [{user: 'zhuts', racerChoice: 'red'}, {user:'bdpellet', racerChoice: 'blue'}, {user:'summertime', racerChoice: 'green'}];
      
      $scope.messageList = [{user: 'zhuts', message: 'my racer is the best!'}, {user: 'bdpellet', message: 'go blue go!'}];
  });


// maybe a better way we can make this part of the controller
// so we could access $scope and its variables easily

// var socket = io.connect('http://url.herokuapp.com:80');
var socket = io.connect('http://localhost:3030');

// hacky workaround for socket.io and an issue where an emit is executed twice
var isAnimating = false;

socket.on('test', function(message) {
  console.log(message);
});


socket.on('setClock', function(time) {
  console.log('clock set');
});

socket.on('startCountdown', function() {
  console.log('countdown started');
});

socket.on('animateRacers', function(racerMoves) {
  if (!isAnimating) {
    for (var racer in racerMoves) {
      animateMovement(racer, racerMoves[racer]);
    }
    isAnimating = true;
  }
});

function animateMovement(racer, moves) {
  moves.forEach(function(move) {
    $('.' + racer).animate({'left':'+=' + move.distance + '%'}, {
      duration: move.time
    });
  });
}