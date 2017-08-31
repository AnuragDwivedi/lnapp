var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower(v) {
	return v.toLowerCase();
}

/**
 * Pricelist
 *
 * The model for a Pricelist
 *
 * @param {String} 	itemName The name of the item
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

var DbSequenceSchema = new Schema({
	_id: {
		type: String,
		required: true
	},
	next: {
		type: Number,
		"default": 1
	}
});

DbSequenceSchema.statics.increment = function (counter, callback) {
	return this.findByIdAndUpdate(counter, {
		$inc: {
			next: 1
		}
	}, {
		new: true,
		upsert: true,
		select: {
			next: 1
		}
	}).exec();
};

module.exports = mongoose.model('DbSequence', DbSequenceSchema);
