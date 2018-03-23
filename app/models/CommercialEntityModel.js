var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Commercial
 *
 * The model for a Commercial entity
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

var CommercialEntitySchema = new Schema({
	commercialEntityId: Number,
	name: {
		type: String,
		required: true
	},
	description: String,
	contacts: {
		primary: String,
		secondary: String,
		email: String
	},
	address: {
		city: String,
		state: String,
		country: String,
		locality: String,
		address: String,
		pincode: Number
	},
	contactPerson: {
		firstName: String,
		lastName: String,
		mobile: String,
		gender: String
	},
	propertyType: String,
	propertyDetails: {
		numberOfRooms: Number,
		size: String
	},
	engagementPhase: [],
	notes: [{
		created: {
			type: Date,
			"default": Date.now
		},
		lastUpdated: {
			type: Date,
			"default": Date.now
		},
		note: String
	}],
	leadSource: {
		type: String,
		"default": "Laundrynerds"
	},
	isEnabled: {
		type: Boolean,
		"default": true
	},
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

module.exports = mongoose.model('CommercialEntity', CommercialEntitySchema);
