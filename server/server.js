var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

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

router.route('/signin')
      
  .post(function(req, res) {
    // Should have a req.body.user and a req.body.roomname
    // interact here with the database given the user and roomname
    
    // redirect to /req.body.roomname with a status code of 201
    res.redirect(201, '/raceView/' + req.body.roomname);
  });

router.route('/raceView/*')

  .get(function(req, res) {
    // Should query the database with the given roomname (may need to check req.url)
    var roomname = req.url;
  })
  
  .post(function(req, res) {
    // Will need to query the database for betting and things like that (stretch goals)
  });
    

io.on('connection', function(socket){
  console.log('a user connected with io');
});


http.listen(port, function(){
  console.log('listening on port ' + port);
});