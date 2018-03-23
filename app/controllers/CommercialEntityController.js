var CommercialEntity = require('../models/CommercialEntityModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

var Q = require("q");

var CommercialEntityController = function () {};

/**
 * Add new Commercial entity.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialEntityController.prototype.createCommercialEntity = function (req, res, next) {
	console.log("Inside commercial create controller");
	DbSequenceController
		.next('commercial_entity')
		.then(function (result) {
			if (!result.next) {
				result.next = null;
			}
			var commercialEntityObj = new CommercialEntity(req.body);
			commercialEntityObj.commercialEntityId = result.next;
			if (req.user && req.user.email) {
				commercialEntityObj.createdBy = req.user.email;
				commercialEntityObj.updatedBy = req.user.email;
			}
			commercialEntityObj.save(function (err) {
				if (err) {
					return next(err);
				} else {
					return res.json(commercialEntityObj);
				}
			});

		})
		.catch(function (error) {
			console.log("Err-Commercial-Cont: " + error);
			return next(error);
		});
};

module.exports = CommercialEntityController;
