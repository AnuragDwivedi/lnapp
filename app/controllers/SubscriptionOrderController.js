var SubscriptionOrder = require('../models/SubscriptionOrderModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

var EnrollmentController = new require('./SubscriptionEnrollmentController');
var SubscriptionEnrollmentController = new EnrollmentController();

var SubscriptionOrderController = function () {};


/**
 * Add new subscription order.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
SubscriptionOrderController.prototype.createSubscriptionEnrollment = function (req, res, next) {
	console.log("Inside subscription order Controller");
	if (req.user && req.user.role === 'Admin') {
		if (req.body.subscriptionEnrollmentId) {
			DbSequenceController
				.next('subscription_order')
				.then(function (result) {
					if (!result.next) {
						result.next = null;
					}
					var orderDetails = req.body;
					var subscriptionOrderObj = new SubscriptionOrder({
						pickupDate: orderDetails.pickupDate,
						deliveryDate: orderDetails.deliveryDate,
						orderStatus: 'Received',
						totalQty: orderDetails.quantity,
						orderId: result.next,
						items: orderDetails.items,
						source: 'Retail',
						instructions: orderDetails.instructions,
						subscriptionEnrollmentId: orderDetails.subscriptionEnrollmentId,
						createdBy: req.user.email,
						updatedBy: req.user.email,
						isAdminCreated: true
					});

					subscriptionOrderObj.save().then(function (subscription) {
						if (subscription) {
							return SubscriptionEnrollmentController.updateEnrollmentForOrder(req, orderDetails.subscriptionEnrollmentId, orderDetails.quantity);
						} else {
							return next(err);
						}
					}).then(function () {
						return res.send(subscriptionOrderObj);
					}, function (err) {
						console.log("Subscription order not saved: " + err);
						return next(err);
					});
				})
				.catch(function (error) {
					console.log("Subscription order not saved 2: " + error);
				});
		} else {
			return res.send(403, "Invalid subscription enrollment id");
		}
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
	//
};


SubscriptionOrderController.prototype.getSubscriptionOrders = function (req, res, next) {
	if (req.user && req.user.role === 'Admin') {
		SubscriptionOrder.
		find({
			orderStatus: {
				$nin: ['Duplicate', 'Delivered', 'Cancelled']
			}
		}).
		populate({
			path: 'subscriptionEnrollmentId',
			model: 'UserSubscription',
			populate: {
				path: 'user',
				model: 'User'
			}
		}).
		sort({
			deliveryDate: 1
		}).
		exec(function (err, subscriptionOrders) {
			if (err) {
				return next(err);
			} else {
				return res.json(subscriptionOrders);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};


SubscriptionOrderController.prototype.getSubscriptionOrderById = function (req, res, next) {
	console.log("Inside subscription order by Id cntrlr");
	var orderId = req.params.orderId;
	if (req.user && req.user.role === 'Admin' && orderId !== null) {
		console.log("Get the order for id: " + orderId);
		SubscriptionOrder
			.findOne({
				_id: orderId
			})
			.populate({
				path: 'subscriptionEnrollmentId',
				model: 'UserSubscription',
				populate: {
					path: 'user',
					model: 'User'
				}
			})
			.exec(function (err, order) {
				if (err) {
					return next(err);
				}
				if (!order) {
					return res.status(404).json({
						error: 'Order not found'
					});
				}
				res.send(order);
			});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

SubscriptionOrderController.prototype.updateSubscriptionOrder = function (req, res, next) {
	console.log("Inside subscription order update cntrlr");
	var orderId = req.params.orderId;
	if (req.user && req.user.role === 'Admin' && orderId !== null) {
		console.log("Updating the order for id: " + orderId);
		SubscriptionOrder.findById(orderId, function (err, order) {
			if (err) {
				return next(err);
			}
			if (!order) {
				return res.status(404).json({
					error: 'Order not found'
				});
			}

			var hasUpdated = false;
			if (req.body.orderStatus !== order.orderStatus) {
				order.orderStatus = req.body.orderStatus; // update the order's status
				hasUpdated = true;
			}
			var diff = null;
			if (req.body.totalQty != order.totalQty) {
				diff = req.body.totalQty - order.totalQty;
				order.totalQty = req.body.totalQty; // update the order's quantity
				hasUpdated = true;
			}
			if (req.body.items) {
				order.items = req.body.items; // update the order's items
				hasUpdated = true;
			}


			// Updating who columns
			if (hasUpdated) {
				order.lastUpdated = new Date();
				order.updatedBy = req.user.email;
			}

			// save the updated order
			order.save().then(function (order) {
				if (order && diff != null) {
					return SubscriptionEnrollmentController.updateEnrollmentForOrder(req, req.body.subscriptionEnrollmentId, diff);
				} else {
					return next(err);
				}
			}).then(function () {
				return res.send(order);
			}, function (err) {
				console.log("Subscription order not saved: " + err);
				return next(err);
			});;
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

module.exports = SubscriptionOrderController;
