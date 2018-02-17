var SubscriptionEnrollment = require('../models/SubscriptionEnrollmentModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

var Q = require("q");

var SubscriptionEnrollmentController = function () {};


/**
 * Add new subscription enrollment.
 * *
 * @param {Object} req the request.
 * @param {Object} res the response.
 * @param {Object} next the chain handler.
 */
SubscriptionEnrollmentController.prototype.createSubscriptionEnrollment = function (req, res, next) {
	console.log("Inside enroll Controller");
	DbSequenceController
		.next('subscription_enrollment')
		.then(function (result) {
			console.log("res:" + result);
			if (!result.next) {
				result.next = null;
			}
			var subscriptionDetails = req.body;
			subscriptionDetails.subscriptionEnrollmentId = result.next;

			if (subscriptionDetails.userId) {
				console.log("User ID passed in request: " + subscriptionDetails.userId);
				createEnrollment(subscriptionDetails, req, res, next, true);
			} else {
				var userObj = {
					firstName: subscriptionDetails.firstName,
					lastName: subscriptionDetails.lastName,
					gender: subscriptionDetails.gender,
					mobile: subscriptionDetails.mobile,
					email: subscriptionDetails.email,
					address: {
						city: 'Hyderabad',
						state: 'Telanagana',
						country: 'India',
						locality: subscriptionDetails.locality,
						address: subscriptionDetails.fullAddress
					},
					created: new Date(),
					lastUpdated: new Date()
				};
				if (req.user) {
					userObj.createdBy = req.user.email;
					userObj.updatedBy = req.user.email;
				} else {
					userObj.createdBy = subscriptionDetails.email;
					userObj.updatedBy = subscriptionDetails.email;
				}

				// Save user
				UserController
					.createUserFromOrder(userObj)
					.then(function (user) {
						var userId = user._id ? user._id : null;
						subscriptionDetails.userId = userId;
						createEnrollment(subscriptionDetails, req, res, next, userId ? true : false);
					})
					.catch(function (error) {
						console.log("Err1: " + error);
						subscriptionDetails.userId = null;
						createEnrollment(subscriptionDetails, req, res, next, false);
						// Handle any error from all above steps
						return next(err);
					});
			}

		});
};

/**
 * Create order.
 * Private
 * @param {Object} res the response.
 */
function createEnrollment(subscriptionDetails, req, res, next, isUserIdPresent) {
	var subscriptionOrderObj;
	if (isUserIdPresent) {
		subscriptionOrderObj = new SubscriptionEnrollment({
			subscriptionEnrollmentId: subscriptionDetails.subscriptionEnrollmentId,
			subscription: subscriptionDetails.subscriptionId,
			user: subscriptionDetails.userId,
			paidAmount: subscriptionDetails.paidAmount,
			paymentStatus: subscriptionDetails.paymentStatus,
			paymentMode: subscriptionDetails.paymentMode,
			clothesRemaining: subscriptionDetails.clothesRemaining
		});
	} else {
		subscriptionOrderObj = new SubscriptionEnrollment({
			firstName: subscriptionDetails.firstName,
			lastName: subscriptionDetails.lastName,
			gender: subscriptionDetails.gender,
			mobile: subscriptionDetails.mobile,
			email: subscriptionDetails.email,
			subscriptionEnrollmentId: subscriptionDetails.subscriptionEnrollmentId,
			subscription: subscriptionDetails.subscriptionId,
			paidAmount: subscriptionDetails.paidAmount,
			paymentStatus: subscriptionDetails.paymentStatus,
			paymentMode: subscriptionDetails.paymentMode,
			clothesRemaining: subscriptionDetails.clothesRemaining,
			user: null
		});
	}

	if (req.user) {
		subscriptionOrderObj.createdBy = req.user.email;
		subscriptionOrderObj.updatedBy = req.user.email;
		subscriptionOrderObj.isAdminCreated = true;
	} else {
		subscriptionOrderObj.createdBy = subscriptionDetails.email;
		subscriptionOrderObj.updatedBy = subscriptionOrderObj.createdBy = subscriptionDetails.email;
		subscriptionOrderObj.isAdminCreated = false;
	}

	subscriptionOrderObj.save(function (err) {
		if (err) {
			return next(err);
		} else {
			return res.json(subscriptionOrderObj);
		}
	});
};

SubscriptionEnrollmentController.prototype.updateEnrollmentForOrder = function (req, subscriptionEnrollmentId, itemsCount) {
	var deferred = Q.defer();
	SubscriptionEnrollment.findById(subscriptionEnrollmentId, function (err, enrollment) {
		if (err) {
			deferred.reject(new Error(err));
		} else {
			// update remaining clothes for enrollment
			enrollment.updatedBy = req.user.email;
			enrollment.lastUpdated = new Date();
			enrollment.clothesRemaining = (enrollment.clothesRemaining ? enrollment.clothesRemaining : 0) - itemsCount;
			return enrollment.save();
		}
	}).then(function (enrollment, err) {
		if (enrollment) {
			deferred.resolve(enrollment);
		} else {
			deferred.reject(new Error(err));
		}
	});

	return deferred.promise;
};

SubscriptionEnrollmentController.prototype.getActiveEnrollments = function (req, res, next) {
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

SubscriptionEnrollmentController.prototype.deleteEnrollment = function (req, res, next) {
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

SubscriptionEnrollmentController.prototype.renewEnrollment = function (req, res, next) {
	console.log("Inside renew enroll by id Controller");
	if (req.user && req.user.role === 'Admin') {
		SubscriptionEnrollment.findById(req.params.enrollId, function (err, enrollment) {
			if (err) {
				return next(err);
			} else {
				// update enrollment to renew
				var today = new Date();
				enrollment.lastRenewed = today;
				enrollment.timesRenewed = enrollment.timesRenewed + 1;
				enrollment.isActive = true;
				enrollment.clothesRemaining = (enrollment.clothesRemaining ? enrollment.clothesRemaining : 0) + req.body.clothes;

				// Handle payments
				if (req.body.paymentStatus && req.body.paymentStatus === "Paid") {
					enrollment.paymentMode = req.body.paymentMode;
					enrollment.paymentStatus = req.body.paymentStatus;
					enrollment.paidAmount = req.body.paidAmount;
				}

				enrollment.updatedBy = req.user.email;
				enrollment.lastUpdated = today;

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

SubscriptionEnrollmentController.prototype.payEnrollment = function (req, res, next) {
	console.log("Inside pay enroll by id Controller");
	if (req.user && req.user.role === 'Admin') {
		SubscriptionEnrollment.findById(req.params.enrollId, function (err, enrollment) {
			if (err) {
				return next(err);
			} else {
				// update enrollment to renew
				if (req.body.paymentStatus && req.body.paymentStatus === "Paid") {
					enrollment.paymentMode = req.body.paymentMode;
					enrollment.paymentStatus = req.body.paymentStatus;
					enrollment.paidAmount = req.body.paidAmount;
				}

				enrollment.updatedBy = req.user.email;
				enrollment.lastUpdated = new Date();

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

module.exports = SubscriptionEnrollmentController;
