var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower(v) {
	return v.toLowerCase();
}

/**
 * Subscription
 *
 * The model for a Subscription
 *
 * @param {String} 	 packageName The name of the subscription
 * @param {String} 	 packageDisplayName The name to be displayed of the subscription
 * @param {String} 	 subscriptionType The type of subscription
 * @param {Number} 	 price The price for laundry
 * @param {Number} 	 numberOfClothes The number of clothes for laundry
 * @param {Number} 	 numberOfPickups The number of pickups/drops for laundry
 * @param {[Object]} items The items covered in subscription
 * @param {Date}  	 created The record creation date.
 * @param {Date} 	 lastUpdated Date on which profile was updated.
 * @api private
 */

var SubscriptionSchema = new Schema({
	packageName: {
		type: String,
		required: true,
		unique: true,
		set: toLower
	},
	packageDisplayName: {
		type: String,
		required: true
	},
	subscriptionType: {
		type: String,
		"default": "per_piece"
	}, // "per_piece", "per_kg"
	description: {
		type: String
	},
	price: {
		type: Number,
		required: true
	},
	numberOfClothes: {
		type: Number,
		required: true
	},
	numberOfPickups: {
		type: Number
	},
	category: {
		type: String,
		"default": "Online" // Other option "Retail"
	},
	isEnabled: {
		type: Boolean,
		"default": true
	},
	duration: {
		type: Number // In days
	},
	items: [Schema.Types.ObjectId],
	createdBy: String,
	created: {
		type: Date,
		"default": Date.now
	},
	updatedBy: String,
	lastUpdated: {
		type: Date,
		"default": Date.now
	}
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
