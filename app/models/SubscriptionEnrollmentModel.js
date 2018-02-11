var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * UserSubscription
 *
 * The model for a UserSubscription
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

var UserSubscriptionSchema = new Schema({
	subscriptionEnrollmentId: Number,
	subscription: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Subscription'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	lastRenewed: {
		type: Date,
		"default": Date.now
	},
	timesRenewed: {
		type: Number,
		"default": 0
	},
	isActive: {
		type: Boolean,
		"default": true
	},
	clothesRemaining: {
		type: Number
	},
	isAdminCreated: Boolean,
	paidAmount: Number,
	paymentStatus: {
		type: String,
		"default": 'Not Paid'
	},
	paymentMode: String,
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

module.exports = mongoose.model('UserSubscription', UserSubscriptionSchema);
