var mongoose = require('mongoose');

mongoURI = process.env.MONGODB_URI ||'mongodb://localhost/trextimerdb';

mongoose.connect(mongoURI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('mongo DB connection is open');
});

module.export = db;