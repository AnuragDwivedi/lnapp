// Subscription Enrollment Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionEnrollmentController');
var SubscriptionEnrollmentController = new Controller();


/**
 * Save new subscription enrollment.
 *
 * endpoint: `/subscriptionenroll`
 * method: POST
 *
 *
 * @return {Object} Create new subscription.
 * @api private
 */
router.post('/', function (req, res, next) {
	SubscriptionEnrollmentController.createSubscriptionEnrollment(req, res, next);
});

/**
 * Get all subscription enrollments.
 *
 * endpoint: `/subscriptionenroll`
 * method: GET
 *
 *
 * @return [Array] all subscription.
 * @api private
 */
router.get('/', function (req, res, next) {
	console.log("Inside subscription get enroll route");
	SubscriptionEnrollmentController.getActiveEnrollments(req, res, next);
});

/**
 * Remove/Deactivate subscription enrollments.
 *
 * endpoint: `/subscriptionenroll`
 * method: DELETE
 *
 *
 * @return {Object} subscription.
 * @api private
 */
router.delete('/:enrollId', function (req, res, next) {
	console.log("Inside subscription delete enroll route");
	SubscriptionEnrollmentController.deleteEnrollment(req, res, next);
});


/**
 * Renew subscription enrollments.
 *
 * endpoint: `/subscriptionenroll`
 * method: PUT
 *
 *
 * @return [Array] all subscription.
 * @api private
 */
router.put('/:enrollId/renew', function (req, res, next) {
	console.log("Inside subscription renew enroll route");
	SubscriptionEnrollmentController.renewEnrollment(req, res, next);
});


/**
 * Pay subscription enrollments.
 *
 * endpoint: `/subscriptionenroll`
 * method: PUT
 *
 *
 * @return [Array] all subscription.
 * @api private
 */
router.put('/:enrollId/pay', function (req, res, next) {
	console.log("Inside subscription pay enroll route");
	SubscriptionEnrollmentController.payEnrollment(req, res, next);
});

module.exports = router;
