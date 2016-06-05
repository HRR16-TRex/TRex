angular.module("app.race", ['ngRoute'])
  
  .controller("raceController", function($scope, $timeout, socket, $routeParams){
      $scope.countdownTime = 1;
      $scope.timerRunning = true;

      $scope.room = $routeParams.roomId;
      $scope.username = $routeParams.userId;

      // room data, populated from the server when time gets set by admin
      $scope.connectedUsers = [];
      $scope.racerMoves = {};
      $scope.messages = [];

      // test server connection
      socket.on('test', function(msg) {
        console.log(msg);
      });

      // instantiate user on the server when connected to a room
      // 2nd callback parameter is checking if admin or not. possibly could be refactored?
      socket.emit('instantiateUser', {username: $scope.username, room: $scope.room }, function(result, msg, isAdmin) {
        $scope.isUserAdmin = isAdmin;
        console.log(logMsg(result, msg));
      });

      // get room data generated on the server for this room
      socket.on('retrieveRoomData', function(data, msg) {
        // populate controller's scope data
        console.log(data);
        $scope.countdownTime = data.time;
        $scope.racerMoves = data.racerMoves;
        addOrUpdateUsers(data.users);

        console.log($scope.connectedUsers);
        // update timer directive
        $scope.$broadcast('timer-set-countdown-seconds', $scope.countdownTime);
        
        console.log('SUCCESS: ' + msg);
      });

      // whenever a user is instantiated on the server, add the updated user to $scope.connectedUsers
      socket.on('retrieveUserData', function(data, msg) {
        // console.log('$scope.connectedUsers ', $scope.connectedUsers);
        addOrUpdateUsers(data.users);
        // $scope.connectedUsers = [data.users];
        console.log('User data loaded: ' + msg);
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
      });

      socket.on('updateMessageData', function(messages, msg) {
        $scope.messages = messages;
        console.log('SUCCESS: ' + msg);
      });

      // This gets triggered when a bet is selected
      // updates the server with the bet information
      var betPlaced = function(betInfo) {
        socket.emit('setUserBet', betInfo, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      var sendMessage = function(messageData) {
        socket.emit('updateMessages', messageData, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // Admin set the time, send room name and time to 
      // the server.. this gets emitted back from the server 
      // to all clients through the event 'retrieveRoomData'
      var setRoomTime = function(roomInfo) {
        socket.emit('setRoomTime', roomInfo, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // Admin started the race, this information gets
      // emitted to all clients from the server through
      // the event 'startRace'
      var toggleRace = function(race) {
        socket.emit('toggleRace', race, function(result, msg) {
          console.log(logMsg(result, msg));
        });
      };

      // utility function for logging messages from the server
      var logMsg = function(result, msg) {
        if (!result) { return 'ERROR: ' + msg; }
        return 'SUCCESS: ' + msg;
      };

      // The admin user for this room should be
      // the only one seeing the controls with this
      // functionality

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

      // Each client will run this code when the
      // countdown has reached 0
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

      // Server user object is not the same makeup of
      // connectedUsers. This is why things get broken
      // out the way they do below.
      // TODO: more elegant solution, update server code to mimic connectedUsers
      var addOrUpdateUsers = function(users) {
        var connectedUsers = {};

        // make connectedUsers an object with users and indexes
        for (var i = 0; i < $scope.connectedUsers.length; i++) {
          connectedUsers[$scope.connectedUsers[i].username] = $scope.connectedUsers[i];
          connectedUsers[$scope.connectedUsers[i].username].index = i;
        }

        // TODO: this can be cleaned up as well.
        // ALL the data is being sent to the clients when
        // certain events get triggered. Ideally you would 
        // only want to send just the item that was updated

        // foreach updated user from the server
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

      // Handles animating movement for each racer.
      // This gets triggered by the server whenever
      // the admin user clicks 'start timer'
      var animateMovement = function(racer, moves) {
        moves.forEach(function(move) {
          $('.' + racer).animate({'left':'+=' + move.distance + '%'}, {
            duration: move.time
          });
        });
      };

      // Utility function for our timer directive.
      var turnToSeconds = function (seconds, minutes) {
        seconds = seconds || 0;
        minutes = minutes || 0;
        return Number(seconds)+Number((minutes*60));
      };

      // Provides the options for the different racers in the drop down
      $scope.racerChoices=['red', 'blue', 'green'];
      
      $scope.sendChatMessage= function(message) {
        var userMessage = {
          user: $scope.username,
          room: $scope.room,
          message: message
        };
        
        // $scope.messageList.push(userMessage);
        sendMessage(userMessage);
      };
      
      // 'Choose' button trigger, sets the chosen racer
      // and lets the server know what racer this user selected.
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

      // $scope.messageList = [{user: 'zhuts', message: 'my racer is the best!'}, {user: 'bdpellet', message: 'go blue go!'}];
  })

  // Factory for using socket.io in racer controller
  // error handling can be applied passing in a
  // callback when executing socket methods

  .factory('socket', function ($rootScope) {
    // For development testing need to set port to 3030 and use localhost
    // var socket = io.connect('http://localhost:3030');
  
    // var socket = io.connect('https://trex-timer.herokuapp.com:80/');
    // var socket = io.connect(window.location.hostname);
    var socket = io.connect();
    
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
