var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower(v) {
	return v.toLowerCase();
}

/**
 * Order
 *
 * The model for a GeneralOrder
 *
 * @param {String} 	firstName The first name of the user
 * @param {String} 	lastName The last name of the user
 * @param {String} 	gender The gender of the user
 * @param {String} 	itemDisplayName The name to be displayed of the item
 * @param {String} 	pricelistType The type of pricelist
 * @param {Number} 	laundryPrice The price for laundry
 * @param {Number} 	drycleanPrice The price for dry cleaning
 * @param {Number} 	ironPrice The price for ironing
 * @param {Array}  	itemCategories The categories item belongs to
 * @param {Date} 	created The record creation date.
 * @param {Date} 	lastUpdated Date on which profile was updated.
 * @api private
 */

var GeneralOrderSchema = new Schema({
	firstName: String,
	lastName: String,
	gender: String,
	mobile: Number,
	email: String,
	pickupDate: Date,
	pickupSlot: String,
	locality: String,
	fullAddress: String,
	deliveryDate: Date,
	orderNumber: String,
	orderStatus: String,
	totalAmount: Number,
	totalQty: Number,
	orderId: Number,
	items: {},
	source: String,
	comments: String,
	isAdminCreated: Boolean,
	created: {
		type: Date,
		"default": Date.now
	},
	createdBy: String,
	lastUpdated: {
		type: Date,
		"default": Date.now
	},
	updatedBy: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model('GeneralOrder', GeneralOrderSchema);
