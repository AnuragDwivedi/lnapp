var SubscriptionEnrollment = require('../models/SubscriptionEnrollmentModel');

var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

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
			paymentMode: subscriptionDetails.paymentMode
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

module.exports = SubscriptionEnrollmentController;
