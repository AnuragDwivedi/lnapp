var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * SubscriptionOrder
 *
 * The model for a SubscriptionOrder
 *
 * @param {Date} 	created The record creation date.
 * @param {Date} 	lastUpdated Date on which profile was updated.
 */

var SubscriptionOrderSchema = new Schema({
	pickupDate: Date,
	deliveryDate: Date,
	orderStatus: String,
	totalQty: Number,
	orderId: Number,
	items: {},
	source: String,
	instructions: String,
	subscriptionEnrollmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'UserSubscription'
	},
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
	updatedBy: String
});

module.exports = mongoose.model('SubscriptionOrder', SubscriptionOrderSchema);
