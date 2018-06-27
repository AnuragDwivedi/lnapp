// Commercial Lead Routes

var router = require('express')();
var LeadController = require('../controllers/CommercialLeadController');
var CommercialLeadController = new LeadController();

var OrderController = require('../controllers/CommercialOrderController');
var CommercialOrderController = new OrderController();

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

/**
 * Save new commercial lead.
 *
 * endpoint: `/order`
 * method: POST
 *
 *
 * @return {Object} Create new lead.
 * @api private
 */
router.post('/order', function (req, res, next) {
	CommercialOrderController.createCommercialOrder(req, res, next);
});

/**
 * Get all commercial orders.
 *
 * endpoint: `/order`
 * method: GET
 *
 *
 * @return [{Object}] Create new lead.
 * @api private
 */
router.get('/order', function (req, res, next) {
	CommercialOrderController.getCommercialOrders(req, res, next);
});

/**
 * Update commercial order by id.
 *
 * endpoint: `/order/:orderId`
 * method: PUT
 *
 *
 * @return {Object} Create new lead.
 * @api private
 */
router.put('/order/:orderId', function (req, res, next) {
	CommercialOrderController.updateCommercialOrderById(req, res, next);
});

/**
 * Get orders for lead by id
 *
 * endpoint: `/lead/:leadId/orders`
 * method: GET
 *
 *
 * @return {Object}.
 * @api private
 */
router.post('/lead/:leadId/orders', function (req, res, next) {
	CommercialOrderController.getOrdersForLeadId(req, res, next);
});


module.exports = router;
