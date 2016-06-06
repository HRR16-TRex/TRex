angular.module("app.race", ['ngRoute', 'luegg.directives'])
  
  .controller("raceController", function($scope, $timeout, socket, $routeParams){
      // ********** Initialize Parameters **********
      // The countdownTime is set to 1 because if it is set to 0 then it gives a "falsy" value and will not function properly
      $scope.countdownTime = 1;
      $scope.timerRunning = true;
      
      // The room and username are pulled from the web address
      $scope.room = $routeParams.roomId;
      $scope.username = $routeParams.userId;

      // The overall room data, populated from the server when time gets set by admin user
      $scope.connectedUsers = [];
      $scope.racerMoves = {};
      $scope.messages = [];
      
      // Provides the options for the different racers in the drop down
      $scope.racerChoices=['red', 'blue', 'green'];


      // ********** Server/Socket Interactions **********
      // Test server connection
      socket.on('test', function(msg) {
        console.log(msg);
      });

      // Instantiate user on the server when connected to a room
      socket.emit('instantiateUser', {username: $scope.username, room: $scope.room }, function(result, msg, isAdmin) {
        $scope.isUserAdmin = isAdmin;
        console.log(logMsg(result, msg));
      });

      // To get room data generated on the server for this room
      socket.on('retrieveRoomData', function(data, msg) {
        // Update current user's controller scope data
        $scope.countdownTime = data.time;
        $scope.racerMoves = data.racerMoves;
        addOrUpdateUsers(data.users);
        
        // Update timer directive with the time set by the admin
        $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownTime);
        console.log('SUCCESS: ' + msg);
      });

      // Whenever a user is instantiated on the server, add the updated user to $scope.connectedUsers
      socket.on('retrieveUserData', function(data, msg) {
        addOrUpdateUsers(data.users);
        console.log('User data loaded: ' + msg);
      });

      // When admin starts race, all clients get notified to start timer and animate racers
      socket.on('startRace', function(status, msg) {
        // Let the timer directive know the client is starting
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
        
        // Animate background
        $('#raceView').css({'animation':'backgroundScroll 15s linear infinite'});
        
        // Iterate over all the racers the server sent us
        for (var racer in $scope.racerMoves) {
          // Animate movement for each racer
          animateMovement(racer, $scope.racerMoves[racer]);
        }
        console.log('SUCCESS: ' + msg);
      });
      
      socket.on('updateMessageData', function(messages, msg) {
        $scope.messages = messages;
        console.log('SUCCESS: ' + msg);
      });
      
      
      // ********** Utility Functions **********
      var sendMessage = function(messageData) {
        socket.emit('updateMessages', messageData, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // When a racer/bet is chosen, this updates the server
      var betPlaced = function(betInfo) {
        socket.emit('setUserBet', betInfo, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // Admin set the time, emitted back from the server to all clients through the event 'retrieveRoomData'
      var setRoomTime = function(roomInfo) {
        socket.emit('setRoomTime', roomInfo, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // Admin started the race, emitted to all clients with startRace
      var toggleRace = function(race) {
        socket.emit('toggleRace', race, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };
      
      // Server user object is not the same as connectedUsers, so this gets updated slightly differently
      var addOrUpdateUsers = function(users) {
        var connectedUsers = {};

        // Make connectedUsers an object with users and indexes
        for (var i = 0; i < $scope.connectedUsers.length; i++) {
          connectedUsers[$scope.connectedUsers[i].username] = $scope.connectedUsers[i];
          connectedUsers[$scope.connectedUsers[i].username].index = i;
        }

        // Iterate over each updated user from the server
        for (var user in users) {
          // check if user is a part of connectedUsers already
          if (!connectedUsers[user]) {
            $scope.connectedUsers.push(users[user]);
          } else { // else the user exists so update its record 
            $scope.connectedUsers[connectedUsers[user].index].racerChoice = users[user].racerChoice;
            // .. other properties you may want to update
          }
        }
      };

      // utility function for logging messages from the server
      var logMsg = function(result, msg) {
        if (!result) { return 'ERROR: ' + msg; }
        return 'SUCCESS: ' + msg;
      };


      // ********** ADMIN User Function **********
      // Only the admin (the user who created the race) should have access to these
      $scope.setTimer = function (seconds, minutes) {
        setRoomTime({ room: $scope.room, time: turnToSeconds(seconds, minutes) });
      };

      $scope.startTimer = function (){
        toggleRace({ status: true, room: $scope.room });
      };

      $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
      };


      // ********** Timer Functionality **********
      // Each client will run this code when the countdown has reached 0
      $scope.countdownComplete = function () {
        var winner = null;

        $('.trex').each(function() {
          if (!winner || Number($(this).css('left').replace('px','')) > Number(winner.css('left').replace('px',''))) {
            winner = $(this);
            console.log(winner);
          }
        });

        winner.css('border', '5px red solid');
        console.log('Countdown complete');
      };
      
      $scope.$on('timer-stopped', function (event, data){
        console.log('Timer Stopped - data = ', data);
      });
      
      // Simple function for our timer directive since it expects the input to be in seconds
      var turnToSeconds = function (seconds, minutes) {
        seconds = seconds || 0;
        minutes = minutes || 0;
        return Number(seconds)+Number((minutes*60));
      };

      
      // ********** Animation/Front-end Interaction **********
      // Handles animating movement for each racer triggered by admin clicking start timer
      var animateMovement = function(racer, moves) {
        moves.forEach(function(move) {
          $('.' + racer).animate({'left':'+=' + move.distance + '%'}, {
            duration: move.time
          });
        });
      };
      
      // To send a message from the user in the proper format
      $scope.sendChatMessage= function(message) {
        // Define the structure of the userMessage before sending it
        var userMessage = {
          user: $scope.username,
          room: $scope.room,
          message: message
        };
        sendMessage(userMessage);
        $scope.chatMessage = null;
      };
      
      // 'Choose' button trigger, sets the chosen racer and lets the server know what racer this user selected.
      $scope.chooseRacer = function(racer) {
        var user = {
          user: $scope.username,
          room: $scope.room,
          racerChoice: racer
        };

        $scope.racerChosen = true;

        // send data to server
        betPlaced(user);
      };
  })

  // Factory for using socket.io in racer controller.
  .factory('socket', function ($rootScope) {
    // For development testing need to set it to use 'http://' since localhost uses http
    // For production, can use either http or https but the web address will have to match it
    var socket = io.connect('https://' + window.location.hostname + ":" + location.port);
    
    // Error handling can be applied passing in a callback when executing socket methods on or emit
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
