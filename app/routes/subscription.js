// User Routes

var router = require('express')();
var Controller = require('../controllers/SubscriptionController');
var SubscriptionController = new Controller();

/**
 * Lists subscriptions.
 *
 * endpoint: `/subscription`
 * method: GET
 *
 *
 * @return {Object} Object of subscriptions.
 * @api public
 */

router.get('/',function(req,res){
    console.log("Inside subscription route");
    SubscriptionController.getSubscriptions(req,res);
});


/**
 * Save new subscription.
 *
 * endpoint: `/subscription`
 * method: POST
 *
 *
 * @return {Object} Create new subscription.
 * @api private
 */


router.post('/',function(req,res,next){
    console.log("Inside subscription route");
    SubscriptionController.createSubscription(req,res,next);
});


module.exports = router;
