// User Routes

var router = require('express')();
var Controller = require('../controllers/GeneralOrderController');
var GeneralOrderController = new Controller();

/**
 * Lists orders.
 *
 * endpoint: `/generalorder`
 * method: GET
 *
 *
 * @return {Object} Objects of all orders.
 * @api public
 */

router.get('/', function (req, res) {
	console.log("Inside generalorder route");
	GeneralOrderController.getGeneralOrders(req, res);
});

/**
 * Orders details.
 *
 * endpoint: `/generalorder`
 * method: GET
 *
 *
 * @return {Object} Objects of selected orders.
 * @api public
 */

router.get('/:orderId', function (req, res) {
	console.log("Inside generalorder details route");
	GeneralOrderController.getGeneralOrderDetails(req, res);
});


/**
 * Save new order.
 *
 * endpoint: `/generalorder`
 * method: POST
 *
 *
 * @return {Object} Created order details.
 * @api public
 */

router.post('/', function (req, res, next) {
	console.log("Inside generalorder route");
	GeneralOrderController.createGeneralOrder(req, res, next);
});


/**
 * Save new order.
 *
 * endpoint: `/generalorder/:orderId`
 * method: PUT
 *
 *
 * @return {Object} Created order details.
 * @api public
 */

router.put('/:orderId', function (req, res, next) {
	console.log("Inside generalorder route for udpate");
	GeneralOrderController.updateGeneralOrders(req, res, next);
});


module.exports = router;
