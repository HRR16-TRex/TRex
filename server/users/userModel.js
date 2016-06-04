var mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs');

var UserSchema = mongoose.Schema({
	username: {
	type: String,
	required: true,
	unique: true
	},
	wins: {
	type: Number,
	default: 0
	},
	losses: {
	type: Number,
	default: 0
	}
});

var User = mongoose.model('User', UserSchema);

module.exports = User;