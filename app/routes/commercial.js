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
 * @return {Object} Create new lead.
 * @api private
 */
router.post('/lead', function (req, res, next) {
	CommercialLeadController.createCommercialLead(req, res, next);
});


/**
 * Get all commercial leads
 *
 * endpoint: `/lead`
 * method: GET
 *
 *
 * @return [Array] Leads.
 * @api private
 */
router.get('/lead', function (req, res, next) {
	CommercialLeadController.getComercialLeads(req, res, next);
});

/**
 * Update commercial lead by ID
 *
 * endpoint: `/lead/:id`
 * method: GET
 *
 *
 * @return {Object} Lead.
 * @api private
 */
router.put('/lead/:leadId', function (req, res, next) {
	CommercialLeadController.udpateComercialLeadById(req, res, next);
});


module.exports = router;
