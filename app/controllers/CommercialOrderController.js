var CommercialOrder = require('../models/CommercialOrderModel');
var CommercialLead = require('../models/CommercialLeadModel');
var ObjectId = require('mongoose').Types.ObjectId;
var ValidateAccess = require('../../utils/ValidateAccess');
var accessUtils = new ValidateAccess();

var CommercialOrderController = function () {};

/**
 * Add new Commercial order.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialOrderController.prototype.createCommercialOrder = function (req, res, next) {
	console.log("Inside commercial order create controller");

	var commercialOrderObj = new CommercialOrder(req.body);
	if (req.user && req.user.email) {
		commercialOrderObj.createdBy = req.user.email;
		commercialOrderObj.updatedBy = req.user.email;
	}
	commercialOrderObj.save(function (err) {
		if (err) {
			return next(err);
		} else {
			return res.json(commercialOrderObj);
		}
	});
};

/**
 * Get all Commercial orders.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialOrderController.prototype.getCommercialOrders = function (req, res, next) {
	console.log("Inside commercial order get controller");

	if (req.user && accessUtils.hasGetOrdersAccess(req.user)) {
		CommercialOrder.
		find({
			orderStatus: {
				$nin: ['Duplicate', 'Delivered', 'Cancelled']
			}
		}).
		populate('commercialLeadId', 'name').
		sort({
			deliveryDate: 1
		}).
		exec(function (err, commercialOrders) {
			if (err) {
				return next(err);
			} else {
				return res.json(commercialOrders);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};


/**
 * Update Commercial order by id.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialOrderController.prototype.updateCommercialOrderById = function (req, res, next) {
	var orderId = req.params.orderId;
	if (req.user && accessUtils.hasGetOrdersAccess(req.user) && orderId !== null) {
		CommercialOrder.findById(orderId, function (err, order) {
			if (err) {
				return next(err);
			}
			if (!order) {
				return res.status(404).json({
					error: 'Order not found'
				});
			}

			var hasUpdated = false;
			if (req.body.orderStatus && (req.body.orderStatus !== order.orderStatus)) {
				order.orderStatus = req.body.orderStatus; // update the order's status

				hasUpdated = true;
			}

			// Updating who columns
			if (hasUpdated) {
				order.lastUpdated = new Date();
				order.updatedBy = req.user.email;
			}

			// save the updated order
			order.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(order);
				}
			});
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};


/**
 * Get commercial orders by order id.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
CommercialOrderController.prototype.getOrdersForLeadId = function (req, res, next) {
	console.log("Inside commercial order controller by lead id");
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
			CommercialOrder.
			find({
				commercialLeadId: new ObjectId(lead._id),
				pickupDate: {
					$gt: req.body.startDate,
					$lt: req.body.endDate
				}
			}).
			sort({
				pickupDate: 1
			}).
			exec(function (err, commercialOrders) {
				if (err) {
					return next(err);
				} else {
					var isLeadDetailsRequired = req.body.leadDetailsRequired;
					var response = {
						"orders": commercialOrders
					};
					if (isLeadDetailsRequired) {
						response.lead = lead;
					}
					return res.json(response);
				}
			});
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

module.exports = CommercialOrderController;