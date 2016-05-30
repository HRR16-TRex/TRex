var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../Client'));

var port = process.env.PORT || 3030;


io.on('connection', function(socket){
  console.log('a user connected with io');
});



// app.get('/', function(req, res){
//   res.send('hello world');
// })

app.listen(port, function(){
  console.log('listening on port ' + port);
});