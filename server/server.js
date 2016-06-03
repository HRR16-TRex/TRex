var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

var db = require('./config/config.js');
var userController = require('./users/userController.js');
var roomController = require('./rooms/roomController.js');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../Client'));

var port = process.env.PORT || 3030;

var router = express.Router();
// All of our routes will be prefixed with /api
app.use('/api', router);

// Basic router to run first
router.use(function(req, res, next) {
    console.log('A request has been sent.');
    next(); // sends us to the next route
});


    // Should have a req.body.user and a req.body.roomname
    // interact here with the database given the user and roomname
    // redirect to /req.body.roomname with a status code of 201
router.route('/signin')

  .post(function(req,res, cb) {

    userController.signin(req, res, cb);
    res.status(201).send('success');
  });

router.route('/raceView/*')

  .get(function(req, res, cb) {
    // Should query the database with the given roomname (may need to check req.url)
    var roomname = req.url;
  })
  
  .post(function(req, res, cb) {
    // Will need to query the database for betting and things like that (stretch goals)
  });
    

io.on('connection', function(client){
  client.emit('test', 'hello from server');

  // when set timer is clicked, the client sends information here to be executed
  client.on('generateRaceData', function(time, racers) {
    io.sockets.emit('setClock');
    generateRacerMoves(time, racers);
  });

  // some reason needed to pass a param in for it to work, status is a boolean
  client.on('startRace', function(status) {
    console.log('race started from client');
    if (status) {
      io.sockets.emit('startCountdown');
      // io.sockets.emit will emit this information to all clients
      io.sockets.emit('animateRacers', racerMoves);
    }
  });

  console.log('a user connected with io');
});


http.listen(port, function(){
  console.log('listening on port ' + port);
});

var racerMoves = {};

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

  racerMoves = moves;
}