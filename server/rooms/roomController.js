var Room = require('./roomModel.js');
  Q = require('q');

	var findRoom = Q.nbind(Room.findOne, Room);
	var createRoom = Q.nbind(Room.create, Room);
	var findAllRooms = Q.nbind(Room.findAll, Room);

	module.exports = {
		// newRoom: function(req, res, cb) {
		// 	var roomname = req.body.roomname;

		// 	findRoom({roomname: username})
		// 		.then(function(room) {
		// 			if (!room) {
		// 				cb(new Error('Room not found'));
		// 			} else {
		// 				//TODO return new room with individual timer
		// 				return
		// 			}
		// 		})
		// },

		// joinRoom: function(req, res, cb) {
		// 	var roomname = req.body.username;

		// 	findRoom({roomname: roomname})
		// 		.then(function(room) {
		// 			if (!room) {
		// 				createRoom({roomname:roomname});
		// 			} else {

		// 			}
		// 		})
		// }

		// allRooms: function(req, res, cb) {

		// }

	}