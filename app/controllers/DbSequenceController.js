var DbSequence = require('../models/DbSequenceModel');
var DbSequenceController = function () {};

/**
 * Save a new pricelist.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */

DbSequenceController.prototype.next = function (seqName) {
	console.log("Inside db sequence\n");

	return DbSequence.increment(seqName);
};

module.exports = DbSequenceController;
