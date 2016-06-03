var User = require('./userModel.js');
var	Q = require('q');
var jwt = require('jwt-simple');


var findUser = Q.nbind(User.findOne, User);
var createUser = Q.nbind(User.create, User);
var findAll = Q.nbind(User.findAll, User);
var findChangeUser = Q.nbind(User.findAndModify, User);

module.exports = {

	// hybrid signin/signup
	signin: function(userObj, cb) {
		// userObj = {'roomname': {users: {'stuff': [Object]}}}
		console.log(userObj);
		var username = userObj.username;
		console.log(username);

		findUser({username: username})
			.then(function(user) {
				if (!user) {
					// TODO: recording to db, not returning properly
					return createUser({username:username});
				} else {
					return user;
				}
			})

			.fail(function(error){
				cb(error);
			});
	},


// setup for single userObj to be passed, might want arrays instead
	userWin: function(userObj,cb){
		var username = userObj.username;

		findChangeUser({
			query: {username: username},
			update: {$inc: {wins: 1} }
		})
		.then(function(user) {
			if (!user) {
				cb(new Error('User not found'));
			} else {
				return user;
			}
		})
		.fail(function(error){
			cb(error);
		});
	},

	userLoss: function(userObj,cb) {
		var username = userObj.username;

		findChangeUser({
			query: {username: username},
			update: {$inc: {losses: 1} }
		})
		.then(function(user) {
			if (!user) {
				cb(new Error('User not found'));
			} else {
				return user;
			}
		})
		.fail(function(error){
			cb(error);
		});
	},

	// Seperate signin/signup features, for use later
	// signin: function(req, res, cb) {
	// 	var username = req.body.username;

	// 	findUser({username: username})
	// 		.then(function(user) {
	// 			if (!user) {
	// 				cb(new Error('User not found'));
	// 			} else {
	// 				return if (foundUser) {
	// 						var token = jwt.encode(user, 'secret');
	// 						res.json({token: token});
	// 					} else {
	// 						return cb(new Error('no user'));
	// 					}
	// 				}
	// 			})
	// 		.fail(function(error){
	// 			cb(error);
	// 		});
	// },

	// signupUser: function(req, res, cb) {
	// 	var username = req.body.username;

	// 	findUser({username: username})
	// 		.then(function(user) {
	// 			if (user) {
	// 				cb(new Error('User already exists'));
	// 			} else {
	// 				return createUser({username:username});
	// 			}
	// 		})
	// 		.then(function(user) {
	// 			if (!user) {
	// 				cb(new Error('User not found'));
	// 			} else {
	// 				return
	// 					if (foundUser) {
	// 						var token = jwt.encode(user, 'secret');
	// 						res.json({token: token});
	// 					} else {
	// 						return cb(new Error('no user'));
	// 					}
	// 			}
	// 		})
	// 		.fail(function(error){
	// 			cb(error);
	// 		});
	// }

	//Keep uncommented until usaged first
	// allusers: function(req, res, cb) {
	// 	findAll()
	// 	.then(function(allUsers){
	// 		if (allUsers){
	// 			return allUsers;
	// 		} else {
	// 			return cb(new Error('users not found'));
	// 		}
	// 	});
	// }
}