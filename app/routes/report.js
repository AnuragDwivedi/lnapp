// User Routes

var router = require('express')();
var Controller = require('../controllers/DashboardController');
var DashboardController = new Controller();

/**
 * Monthly new customer data.
 *
 * endpoint: `/report/dashboard/customers`
 * method: GET
 *
 *
 * @return {Object} Object of customers per month-year.
 * @api public
 */
router.get('/customers/dashboard', function (req, res) {
	console.log("Inside dashboard customer route");
	DashboardController.getCustomersMonthly(req, res);
});

/**
 * Monthly new orders data.
 *
 * endpoint: `/report/dashboard/orders`
 * method: GET
 *
 *
 * @return {Object} Object of orders per month-year.
 * @api public
 */
router.get('/orders/dashboard', function (req, res) {
	console.log("Inside dashboard orders route");
	DashboardController.getOrdersMonthly(req, res);
});

module.exports = router;
