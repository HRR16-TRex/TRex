var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

var db = require('./config/config.js');
var userController = require('./users/userController.js');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../Client'));

var port = process.env.PORT || 3030;

var gameData = {};

<<<<<<< b6a6c83481e8d273f7c769cae1c7919222f17df2
io.on('connection', function(client){
  client.emit('test', 'hello from the other sideeeee');

  // *********
  // Attach a user to a room
  // racer controller has been loaded for a client so the 
  // user information needs to get added to the global object. 
  // This is also a convenient spot to add the room and set the 
  // first user as the admin if it doesn't already exist.

  client.on('instantiateUser', function(user, callback) {
    // check if room already exists, if it doesn't then add it
    console.log('this is the user ', user);
    if (!gameData[user.room]) {
      gameData[user.room] = {};
    }

    // ********
    // When users are added, the client id is stored as the key
    // for that user. This makes emitting room data back to the
    // clients that are in that specific room an easy task.

    userController.getUserStats(user.username, function(userData) {
      // if room user property doesn't exists, create it and add a user to be the admin
      if (!gameData[user.room].users) {
        gameData[user.room].users = {};
        gameData[user.room].users[client.id] = { admin: true, username: user.username, wins: userData.wins, loss: userData.losses };
        callback(true, 'Admin has been added to the room', true);
      } else if (!gameData[user.room].users[client.id]) { // add the user if it doesn't exist in that room
        gameData[user.room].users[client.id] = { admin: false, username: user.username, wins: userData.wins, loss: userData.losses };
        callback(true, 'User has been added to the room', false);
      } else { // error, user probably exists in that room
        callback(false, 'User already exists in this room');
      }
    });
  });

  // *********
  // Find and add the time and racer moves
  // to the global variable, this will be
  // emitted back to all clients that are a
  // part of this room through clientId
  client.on('setRoomTime', function(roomInfo, callback) {
    // set the time for the room specified
    gameData[roomInfo.room].time = roomInfo.time;
    // add the racerMoves for the specified room
    gameData[roomInfo.room].racerMoves = generateRacerMoves(roomInfo.time, ['one','two','three','four','five']);
    // only send room data to clients that are a part of that specific room
    for (var client in gameData[roomInfo.room].users) {
      io.to(client).emit('retrieveRoomData', gameData[roomInfo.room], 'Game data retrieved for room: ' + roomInfo.room);
    }
    // log back to the admin that the server stored accepted the time
    callback(true, 'Server has stored your time for room: ' + roomInfo.room);
  });

  // *********
  // Trigger that comes from the admin client,
  // this will notify all clients that are a 
  // part of the same room to start their countdown
  // and animate the racers.
  client.on('toggleRace', function(race, callback) {
    if (race.status) {
      // only trigger the clients that are a part of the specific room
      for (var client in gameData[race.room].users) {
        io.to(client).emit('startRace', true, 'The race for room ' + race.room + ' has begun!');
      }
      callback(true, 'Server has triggered the race to start for room: ' + race.room);
    } else {
      callback(false, 'Server failed to start the race for room: ' + race.room)
    }
  });
});


http.listen(port, function(){
  console.log('listening on port ' + port);
});

// TODO: improve this logic and make the movement more interesting

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

  for (racer in moves) {
    if (racer !== winner) {
      var randomMoves = Math.floor(Math.random() * 20), rnd;
      for (var i = 0; i < randomMoves; i++) {
        rnd = Math.floor(Math.random() * moves[racer].length);
        moves[racer][rnd].distance = 0;
      }
    }
  }

  return moves;
}