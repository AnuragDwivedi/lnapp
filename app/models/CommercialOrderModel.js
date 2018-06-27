var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Commercial Order
 *
 * The model for a CommercialOrder
 *
 * @api private
 */

var CommercialOrderSchema = new Schema({
	pickupDate: Date,
	deliveryDate: Date,
	actualDeliveryDate: Date,
	orderStatus: String,
	totalQty: Number,
	items: [{
        itemName: String,
        quantity: Number
    }],
    commercialLeadId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CommercialLead'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
	isAdminCreated: {
        type: Boolean,
        default: true
    },
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
    pickedUpBy: String
});

module.exports = mongoose.model('CommercialOrder', CommercialOrderSchema);
