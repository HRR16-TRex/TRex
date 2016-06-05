var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').createServer(app);

var io = require('socket.io')(http);

var db = require('./database/config/config.js');
var userController = require('./database/users/userController.js');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../Client'));

var port = process.env.PORT || 3030;

// This gameData object will store the current races and everything on the server (will not persist)
var gameData = {};

// ********** Socket io Section **********
io.on('connection', function(client){
  client.emit('test', 'hello from the other sideeeee');


  // This finds/creates room and user as well as makes the first user the admin if one does not exist already
  client.on('instantiateUser', function(user, callback) {
    // Check to see if the room already exists
    if (!gameData[user.room]) {
      // If it doesn't exist on the server, then create a room object for it on the server's gameData object
      gameData[user.room] = {};
    }
    
    // Queries the database to get wins/losses of user if they exist
    userController.getUserStats(user.username, function(userData) {
      // if room user property doesn't exists, create it and add a user to be the admin
      if (!gameData[user.room].users) {
        gameData[user.room].users = {};
        gameData[user.room].users[user.username] = { admin: true, username: user.username, clientId: client.id, wins: userData.wins, loss: userData.losses, racerChoice: null };
        sendDataToClients(gameData[user.room].users, 'retrieveUserData', gameData[user.room], 'user data loaded for room' + user.room);
        // This callback fires to the user so the message will be displayed on the console
        
        // The third parameter carries whether or not the user is the admin
        callback(true, 'Admin has been added to the room', true);
      } else if (!gameData[user.room].users[user.username]) { 
        // add the user if it doesn't exist in that room
        gameData[user.room].users[user.username] = { admin: false, username: user.username, clientId: client.id, wins: userData.wins, loss: userData.losses, racerChoice: null };
        sendDataToClients(gameData[user.room].users, 'retrieveUserData', gameData[user.room], 'user data loaded for room' + user.room);
        
        // The third parameter carrying that the user is not an admin
        callback(true, 'User has been added to the room', false);
      } else { // error, user probably exists in that room
        
        callback(false, 'User already exists in this room');
      }
    });

  });

  // Add bet information from the client
  client.on('setUserBet', function(betInfo, callback) {
    var userClientId = gameData[betInfo.room].users[betInfo.user].clientId;
    gameData[betInfo.room].users[betInfo.user].racerChoice = betInfo.racerChoice;
    
    sendDataToClients(gameData[betInfo.room].users, 'retrieveUserData', gameData[betInfo.room], 'A client has placed a bet.');

    callback(true, 'Server has stored your bet.');

    var isUserRight;
    betInfo.racerChoice === gameData[betInfo.room].winner ? isUserRight = true : isUserRight = false;
    userController.updateUserStats(betInfo.user, isUserRight);
  });

  // Update messages for the room
  client.on('updateMessages', function(messageInfo, callback) {
    if (!gameData[messageInfo.room].messages) {
      gameData[messageInfo.room].messages = [];
    }
    gameData[messageInfo.room].messages.push(messageInfo);
    sendDataToClients(gameData[messageInfo.room].users, 'updateMessageData', gameData[messageInfo.room].messages, 'A message has been added to the server.');
  });

  // Upon the roomTime being set, all the racer moves are calculated and emitted back to all the clients
  client.on('setRoomTime', function(roomInfo, callback) {
    // set the time for the room specified
    gameData[roomInfo.room].time = roomInfo.time;
    // add the racerMoves for the specified room
    var raceResults = generateRacerMoves(roomInfo.time, ['red', 'blue', 'green']);
    gameData[roomInfo.room].racerMoves = raceResults.moves;
    gameData[roomInfo.room].winner = raceResults.winner;

    // only send room data to clients that are a part of that specific room
    sendDataToClients(gameData[roomInfo.room].users, 'retrieveRoomData', gameData[roomInfo.room], 'The data race for room ' + roomInfo.room + ' has been loaded');
    // log back to the admin that the server stored accepted the time
    callback(true, 'Server has stored your time for room: ' + roomInfo.room);
  });

  // Trigger that comes from the admin client to start all the countdowns/races of clients in the room
  client.on('toggleRace', function(race, callback) {
    if (race.status) {
      // only trigger the clients that are a part of the specific room
      sendDataToClients(gameData[race.room].users, 'startRace', true, 'The race for room ' + race.room + ' has begun!');
      callback(true, 'Server has triggered the race to start for room: ' + race.room);
    } else {
      callback(false, 'Server failed to start the race for room: ' + race.room)
    }
  });
});


http.listen(port, function(){
  console.log('listening on port ' + port);
});

// ********** Utility Server Functions **********
var getUser = function(room, username) {
  var clientId = null;
  for (var user in gameData[room].users) {
    if (gameData[room].users[user.clientId].username === username) {
      clientId = client;
    }
  }
  return clientId;
};

var sendDataToClients = function(users, eventName, data, msg) {
  for (var user in users) {
    io.to(users[user].clientId).emit(eventName, data, msg);
  }
};


// The racer moves are an array full of incremental moves that should end 
// with the racer near the end of the alloted space at the end of the alloted time
var generateRacerMoves = function(time, racers) {
  var moves = {};
  time = time * 1000;

  for (var i = 0; i < racers.length; i++) {
    var racerTime = 0, move;
    moves[racers[i]] = [];

    for (var j = 0; j < 100; j++) {
      moves[racers[i]].push({time:time / 100, distance: 1});
    }
  }

  var winner = racers[Math.floor(Math.random() * racers.length)];

  for (var racer in moves) {
    if (racer !== winner) {
      var randomMoves = Math.floor(Math.random() * 20), rnd;
      for (var i = 0; i < randomMoves; i++) {
        rnd = Math.floor(Math.random() * moves[racer].length);
        moves[racer][rnd].distance = 0;
      }
    }
  }

  return { moves:moves, winner:winner };
};
