var Q = require('q');
var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
	roomname: {
	type: String,
	required: true,
	unique: true
	}
});

//TODO tie individual instances of timer to rooms

module.exports = mongoose.model('rooms', RoomSchema);