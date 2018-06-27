var CommercialLead = require('../models/CommercialLeadModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

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
			if (req.body.notes.note === "") {
				// Delete notes object if empty
				delete req.body.notes;
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

/**
 * Get all Commercial leads.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialLeadController.prototype.getComercialLeads = function (req, res, next) {
	console.log("Inside commercial get controller");

	if (req.user && req.user.role === 'Admin') {
		var findCondition = req.query.isEnabled === undefined ? {} : {
			isEnabled: req.query.isEnabled
		};

		CommercialLead.
		find(findCondition).
		sort({
			lastUpdated: 1
		}).
		exec(function (err, leads) {
			if (err) {
				return next(err);
			} else {
				return res.json(leads);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

/**
 * Udpate commercial lead by id.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialLeadController.prototype.udpateComercialLeadById = function (req, res, next) {
	console.log("Inside commercial update controller");
	var leadId = req.params.leadId;
	if (req.user && req.user.role === 'Admin' && leadId != null) {
		CommercialLead.findById(leadId, function (err, lead) {
			if (err) {
				return next(err);
			}
			if (!lead) {
				return res.status(404).json({
					error: 'Lead not found for id: ' + leadId
				});
			}
			var hasUpdated = false;
			if (req.body.note) {
				lead.notes.push({
					note: req.body.note
				});
				hasUpdated = true;
			}
			if (req.body.phase && req.body.phase != lead.engagementPhase[lead.engagementPhase.length - 1]) {
				lead.engagementPhase.push(req.body.phase);
				if(req.body.phase === "Cancelled") {
					lead.isEnabled = false;
				}
				hasUpdated = true;
			}
			if(req.body.pricelist && req.body.pricelist.length) {
				lead.pricelist = req.body.pricelist;
				hasUpdated = true;
			}

			// Updating who columns
			if (hasUpdated) {
				lead.lastUpdated = new Date();
				lead.updatedBy = req.user.email;
			}

			// save the updated lead
			lead.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(lead);
				}
			});
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

module.exports = CommercialLeadController;