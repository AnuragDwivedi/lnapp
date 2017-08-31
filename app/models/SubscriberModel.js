var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower(v) {
  return v.toLowerCase();
}

/**
 * Subscribe
 *
 * The model for a Subscribe
 *
 * @param {String} email The email of subscibed user
 * @param {String} fullName The full name of user hitting the page
 * @param {Date} created The record creation date.
 * @api public
 */

var SubscriberSchema = new Schema({
	email: { type: String, required: true, unique: true, set: toLower },
	fullName: String,
	mobile: String,
	created: { type : Date, "default": Date.now }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
