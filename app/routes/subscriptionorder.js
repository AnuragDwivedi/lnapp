// Subscription Order Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionOrderController');
var SubscriptionOrderController = new Controller();


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
	SubscriptionOrderController.createSubscriptionEnrollment(req, res, next);
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
//router.get('/', function (req, res, next) {
//	SubscriptionOrderController.getActiveEnrollments(req, res, next);
//});


module.exports = router;
