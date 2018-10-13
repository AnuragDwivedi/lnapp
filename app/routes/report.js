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
 * @return {Object} Object of subscriptions.
 * @api public
 */

router.get('/dashboard/customers', function (req, res) {
	console.log("Inside dashboard customer route");
	DashboardController.getCustomersMonthly(req, res);
});

module.exports = router;
