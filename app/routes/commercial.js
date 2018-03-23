// Commercial Entity Routes

var router = require('express')();
var Controller = require('../controllers/CommercialEntityController');
var CommercialEntityController = new Controller();


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
router.post('/entity', function (req, res, next) {
	CommercialEntityController.createCommercialEntity(req, res, next);
});


module.exports = router;
