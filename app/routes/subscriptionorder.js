// Subscription Order Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionOrderController');
var SubscriptionOrderController = new Controller();


/**
 * Save new subscription order.
 *
 * endpoint: `/subscriptionorder`
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
 * endpoint: `/subscriptionorder`
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
 * Get subscription order by Id.
 *
 * endpoint: '/subscriptionorder/:orderId'
 * method: GET
 *
 *
 * @return {Object} subscription.
 * @api private
 */
router.get('/:orderId', function (req, res, next) {
	SubscriptionOrderController.getSubscriptionOrderById(req, res, next);
});

/**
 * Update subscription order by ID.
 *
 * endpoint: `/subscriptionorder/:orderId`
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
