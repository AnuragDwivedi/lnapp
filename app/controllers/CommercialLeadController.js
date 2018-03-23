var CommercialLead = require('../models/CommercialLeadModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

var Q = require("q");

var CommercialLeadController = function () {};

/**
 * Add new Commercial lead.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialLeadController.prototype.createCommercialLead = function (req, res, next) {
	console.log("Inside commercial create controller");
	DbSequenceController
		.next('commercial_lead')
		.then(function (result) {
			if (!result.next) {
				result.next = null;
			}
			var commercialLeadObj = new CommercialLead(req.body);
			commercialLeadObj.commercialLeadId = result.next;
			if (req.user && req.user.email) {
				commercialLeadObj.createdBy = req.user.email;
				commercialLeadObj.updatedBy = req.user.email;
			}
			commercialLeadObj.save(function (err) {
				if (err) {
					return next(err);
				} else {
					return res.json(commercialLeadObj);
				}
			});

		})
		.catch(function (error) {
			console.log("Err-Commercial-Cont: " + error);
			return next(error);
		});
};

module.exports = CommercialLeadController;
