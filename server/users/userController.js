var User = require('./userModel.js');

module.exports = {
  
  // So this does result in a updating all the array of all our users
  // getAll: function() {
  //   User.find({}).exec(function(err, users) {
  //     console.log('the err here ', err);
  //     console.log('the users here in getAll ', users);
  //     return users;
  //   });
  // },


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
    // expecting didUserWin to be true if won and false if not
    // check to ensure it is properly incrementing
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