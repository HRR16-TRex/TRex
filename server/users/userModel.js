var Q = require('q');
var mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
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

module.exports = mongoose.model('users', UserSchema);