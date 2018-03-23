// Commercial Lead Routes

var router = require('express')();
var Controller = require('../controllers/CommercialLeadController');
var CommercialLeadController = new Controller();


/**
 * Save new commercial lead.
 *
 * endpoint: `/lead`
 * method: POST
 *
 *
 * @return {Object} Create new subscription.
 * @api private
 */
router.post('/lead', function (req, res, next) {
	CommercialLeadController.createCommercialLead(req, res, next);
});


module.exports = router;
