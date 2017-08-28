// User Routes

var router = require('express')();
var Controller = require('../controllers/PricelistController');
var PricelistController = new Controller();

/**
 * Lists pricelists.
 *
 * endpoint: `/pricelist`
 * method: GET
 *
 *
 * @return {Object} Objects of per pirce nad subscription pricelist.
 * @api public
 */

router.get('/',function(req,res){
    console.log("Inside pricelist route");
    PricelistController.getPricelists(req,res);
});


/**
 * Save new pricelist.
 *
 * endpoint: `/pricelist`
 * method: POST
 *
 *
 * @return {Object} Created pricelist review.
 * @api private
 */


router.post('/',function(req,res,next){
    console.log("Inside pricelist route");
    PricelistController.createPricelist(req,res,next);
});


module.exports = router;
