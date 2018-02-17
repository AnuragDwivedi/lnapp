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


SubscriptionOrderController.prototype.getActiveEnrollments = function (req, res, next) {
	console.log("Inside get all enroll Controller");
	var findCondition = req.query.isActive === undefined ? {} : {
		isActive: req.query.isActive
	};
	if (req.user && req.user.role === 'Admin') {
		SubscriptionEnrollment.
		find(findCondition).
		populate('subscription user').
		//select('-_id firstName lastName gender orderStatus mobile email pickupDate pickupSlot locality fullAddress').
		sort({
			lastRenewed: 1
		}).
		exec(function (err, enrollments) {
			if (err) {
				return next(err);
			} else {
				return res.json(enrollments);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

SubscriptionOrderController.prototype.deleteEnrollment = function (req, res, next) {
	console.log("Inside delete enroll by id Controller");
	if (req.user && req.user.role === 'Admin') {
		SubscriptionEnrollment.findById(req.params.enrollId, function (err, enrollment) {
			if (err) {
				return next(err);
			} else {
				// update enrollment to make inactive
				enrollment.isActive = false;
				enrollment.updatedBy = req.user.email;
				enrollment.lastUpdated = new Date();;
				enrollment.save(function (err) {
					if (err) {
						return next(err);
					} else {
						res.send(enrollment);
					}
				});
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

module.exports = SubscriptionOrderController;
