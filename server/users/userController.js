var User = require('./userModel.js');

module.exports = {
  getUserStats: function(username, callback) {	
  	User.findOne({username: username}).exec(function(err, foundUser) {
  		if (foundUser) {
        console.log('found the user');
  			callback(foundUser);
  		} else {
        console.log('did not find the user');
  			var user = {username: username, wins: 0, losses: 0};
        User.create(user);
        callback(user);
  		}
  	});
  },
  
  updateUserStats: function(username, didUserWin, callback) {
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
  }
};