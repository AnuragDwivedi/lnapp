var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * Page
 *
 * The model for a Page
 *
 * @param {String} latitude The latitude of user hitting the page
 * @param {String} longitude The longitude of user hitting the page
 * @param {String} fullAddress The fulladdress of user hitting the page
 * @param {String} locality The locality of user hitting the page
 * @param {String} city The city of user hitting the page
 * @param {String} state The state of user hitting the page
 * @param {String} country The country of user hitting the page
 * @param {Date} created The record creation date.
 * @param {Date} lastHitDateTime The page hit time, will be updated in case of multiple hit.
 * @param {Number} hitCount The number of times page is hit.
 * @api public
 */

var PageSchema = new Schema({
	latitude: String,
	longitude: String,
	address: {
		fullAddress: String,
		locality: String,
		city: String,
		state: String,
		country: String
	},
    created: { type : Date, "default": Date.now },
    lastHitDateTime: { type : Date, "default": Date.now },
    hitCount: { type : Number, "default": 1 }
});

module.exports = mongoose.model('Page', PageSchema);
