var mongoose = require('mongoose');
var crypto = require('crypto');
//var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var Schema = mongoose.Schema;

function toLower(v) {
	return v.toLowerCase();
}

/**
 * User
 *
 * The model for a User
 *
 *
 *
 * @param {String} firstName The new user's first name.
 * @param {String} middleName The new user's middle name.
 * @param {String} lastName The new user's last name.
 * @param {String} username The new user's intended username.
 * @param {String} email The new user's email address.
 * @param {String} password The new user's password.
 * @param {String} mobile The new user's mobile number.
 * @param {String} alternateMobile The new user's alternate mobile number.
 * @param {String} phone The new user's phone/landline number.
 * @param {String} gender The new user's gender.
 * @param {Date} dob The new user's date of birth.
 * @param {Object} address The new user's full address.
 * @param {Date} lastUpdated The new user's last updation date.
 * @param {Date} created The new user's creation date.
 * @param {Date} lastLogin The new user's last login time.
 * @param {Object} avatar Contains one parameter (avatar.image) that expects a base64 image.
 * @param {Object} socialMedia_id The new user's link to social login method used.
 * @api public
 */


var UserSchema = new Schema({
	userId: Number,
	firstName: String,
	middleName: String,
	lastName: String,
	username: {
		type: String,
		set: toLower
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	mobile: String,
	alternateMobile: String,
	phone: String,
	role: String, // Admin, Manager, Customer, PD (Pickup - Delivery)
	gender: String,
	dob: Date,
	address: {
		city: String,
		state: String,
		country: String,
		locality: String,
		address: String,
		pincode: Number
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	lastUpdated: Date,
	created: Date,
	createdBy: String,
	updatedBy: String,
	lastLogin: Date,
	active: Boolean,
	socialMedia_id: {
		type: Schema.Types.ObjectId,
		ref: 'SocialMedia'
	},
	avatar: {
		image: String
	}
});

// prevent password hash from being returned in model
UserSchema.methods.toJSON = function () {
	var obj = this.toObject();
	delete obj.password;
	return obj;
};


UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	if (this.password === candidatePassword) {
		cb(null, true);
	} else {
		return cb(null, false);
	}
	//	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
	//		if (err) return cb(err);
	//		cb(null, isMatch);
	//	});
};

//UserSchema.pre('save', function (next) {
//	var user = this;
//	var SALT_WORK_FACTOR = 5;
//	if (!user.isModified('password')) return next();
//
//	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
//		if (err) return next(err);
//		bcrypt.hash(user.password, salt, null, function (err, hash) {
//			if (err) return next(err);
//			user.password = hash;
//			next();
//		});
//	});
//});


module.exports = mongoose.model('User', UserSchema);
