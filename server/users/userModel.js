var Q = require('q');
var mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
	username: {
	type: String,
	required: true,
	unique: true
	}
});

module.exports = mongoose.model('users', UserSchema);