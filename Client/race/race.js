angular.module("app.race", ['ngRoute'])
  
  .controller("raceController", function($scope, $timeout, socket, $routeParams){
      $scope.countdownTime = 1;
      $scope.timerRunning = true;

      // room data, populated from the server when time gets set by admin
      $scope.connectedUsers = {};
      console.log($scope.connectedUsers);

      $scope.racerMoves = {};

      // test server connection
      socket.on('test', function(msg) {
        console.log(msg);
      });

      $scope.room = $routeParams.roomId;

      // instantiate user on the server when connected to a room
      // 2nd callback parameter is checking if admin or not. possibly could be refactored?
      socket.emit('instantiateUser', {username: 'test', room: $scope.room }, function(result, msg, isAdmin) {
        $scope.isUserAdmin = isAdmin;
        console.log(logMsg(result, msg));
      })

      // get room data generated on the server for this room
      socket.on('retrieveRoomData', function(data, msg) {
        // populate controller's scope data
        $scope.countdownTime = data.time;
        $scope.connectedUsers = data.users;
        console.log(data.users);
        $scope.racerMoves = data.racerMoves;

        // update timer directive
        $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownTime);
        
        console.log('SUCCESS: ' + msg);
      });

      // when admin starts race, all clients get notified to start timer and animate racers
      socket.on('startRace', function(status, msg) {
        // let the timer directive know the client is starting
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
        // animate background
        $('#raceView').css({'animation':'backgroundScroll 15s linear infinite'});
        // iterate over all the racers the server sent us
        for (var racer in $scope.racerMoves) {
          // animate movement for each racer
          animateMovement(racer, $scope.racerMoves[racer]);
        }

        console.log('SUCCESS: ' + msg);
      })

      // Admin set the time, send room name and time to 
      // the server.. this gets emitted back from the server 
      // to all clients through the event 'retrieveRoomData'
      var setRoomTime = function(roomInfo) {
        socket.emit('setRoomTime', roomInfo, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      }

      // Admin started the race, this information gets
      // emitted to all clients from the server through
      // the event 'startRace'
      var toggleRace = function(race) {
        socket.emit('toggleRace', race, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      }

      // utility function for logging messages from the server
      var logMsg = function(result, msg) {
        if (!result) { return 'ERROR: ' + msg; }
        return 'SUCCESS: ' + msg;
      }

      // ADMIN CONTROLS ***
      // the admin user for this room should be
      // the only one seeing the controls for this
      // functionality

      $scope.setTimer = function (seconds, minutes) {
        setRoomTime({ room: $scope.room, time: turnToSeconds(seconds, minutes) });
      };

      $scope.startTimer = function (){
        toggleRace({ status: true, room: $scope.room });
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

      $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
      };
                
      $scope.$on('timer-stopped', function (event, data){
        console.log('Timer Stopped - data = ', data);
      });

      var animateMovement = function(racer, moves) {
        moves.forEach(function(move) {
          $('.' + racer).animate({'left':'+=' + move.distance + '%'}, {
            duration: move.time
          });
        });
      }

      var turnToSeconds = function (seconds, minutes) {
        seconds = seconds || 0;
        minutes = minutes || 0;
        return Number(seconds)+Number((minutes*60));
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
  })

  // Factory for using socket.io in racer controller
  // error handling can be applied passing in a
  // callback when executing socket methods

  .factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:3030');

    var on = function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    };

    var emit = function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    };

    return {
      on: on,
      emit: emit
    };
  });     