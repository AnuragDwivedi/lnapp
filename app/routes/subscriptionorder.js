// Subscription Order Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionOrderController');
var SubscriptionOrderController = new Controller();


/**
 * Save new subscription order.
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
 * Get all subscription orders.
 *
 * endpoint: `/subscriptionenroll`
 * method: GET
 *
 *
 * @return [Array] all subscription.
 * @api private
 */
router.get('/', function (req, res, next) {
	SubscriptionOrderController.getSubscriptionOrders(req, res, next);
});

/**
 * Update subscription order by ID.
 *
 * endpoint: `/subscriptionenroll`
 * method: PUT
 *
 *
 * @return updated subscription order.
 * @api private
 */
router.put('/:orderId', function (req, res, next) {
	SubscriptionOrderController.updateSubscriptionOrder(req, res, next);
});

module.exports = router;
