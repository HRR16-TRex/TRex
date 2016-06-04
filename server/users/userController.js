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
		console.log('this is the dfsdf', userObj);
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

      // var userWins = userController.getUserWins(user.username);
      // var userLosses = userController.getUserLosses(user.username);
  getUserStats: function(username, callback) {	
  	User.findOne({username: username}).exec(function(err, foundUser) {
  		if (foundUser) {
  			callback(foundUser);
  		} else {
  			console.log('Error: Did not find user stats');
  		}
  	});
  },
  
  updateUserStats: function(username, didUserWin, callback) {
    // expecting didUserWin to be true if won and false if not
    if (didUserWin) {
      User.update({username: username}, {$inc: {wins: 1}}, function (err, data) {
        if (err) {
          console.log('Error ', err);
        } else {
          console.log('The response was ', data);
        }
      });
    } else {
      User.update({username: username}, {$inc: {losses: 1}}, function (err, data) {
        if (err) {
          console.log('Error ', err);
        } else {
          console.log('The response was ', data);
        }
      });
    }
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
};