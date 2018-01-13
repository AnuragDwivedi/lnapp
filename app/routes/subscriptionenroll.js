// User Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionEnrollmentController');
var SubscriptionEnrollmentController = new Controller();


/**
 * Save new subscription enrollment.
 *
 * endpoint: `/subscription`
 * method: POST
 *
 *
 * @return {Object} Create new subscription.
 * @api private
 */
router.post('/', function (req, res, next) {
	console.log("Inside subscription enroll route : " + SubscriptionEnrollmentController);
	SubscriptionEnrollmentController.createSubscriptionEnrollment(req, res, next);
});

module.exports = router;
