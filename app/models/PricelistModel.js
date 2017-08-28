var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function toLower (v) {
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

var PricelistSchema = new Schema({
	itemName: { type: String, required: true, unique: true, set: toLower },
	itemDisplayName: { type: String, required: true },
	pricelistType: { type: String, set: toLower, "default": "per_piece"}, // "per_piece", "per_kg"
	laundryPrice: { type: Number },
	drycleanPrice: { type: Number },
	ironPrice: { type: Number },
	itemCategories: [String],
    created: { type : Date, "default": Date.now },
    lastUpdated: { type : Date, "default": Date.now }
});

module.exports = mongoose.model('Pricelist', PricelistSchema);
