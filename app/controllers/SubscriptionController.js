var Subscription = require('../models/SubscriptionModel');
var SubscriptionController = function(){};

/**
 * Save a new subscription.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */

SubscriptionController.prototype.createSubscription = function (req, res, next){
  console.log("Inside create subscription\n");
    
  if (req.body) {
	  var subscription = req.body;
      var subscriptionObj = new Subscription({packageName: subscription.packageName,
            packageDisplayName: subscription.packageDisplayName,
            price: subscription.price,
            numberOfClothes: subscription.numberOfClothes,
            numberOfPickups: subscription.numberOfPickups,
            description: subscription.description});

      if (subscription.items) {
          subscriptionObj.items = subscription.items;
      }

      Subscription.findOne({packageName: subscription.packageName}, function (err, results) {
          if (err) return next(err);
          if (results) {
              res.send('A subscription with name ' + subscription.packageName + ' already exists.', 500);
          }
          else {
              console.log("Saving subscription");
              subscriptionObj.save(function (err, subscription) {
                  if (err) {
                      console.log("Err: " + err);
                      return next(err);
                  } else {
                      return res.json(subscriptionObj);
                  }
                  
              });
          }
      });
  }
};


/**
 * Get subscriptions.
 *
 * @param {Object} res the response.
 */

SubscriptionController.prototype.getSubscriptions = function (req, res, next) {
    console.log("getting all the subscriptions");
    
    Subscription.
        find().
    	select('-_id packageName packageDisplayName subscriptionType price numberOfClothes numberOfPickups description').
    	exec(function(err, subscriptions) {
         if (err) {
             return next(err);
         } else {
             return res.json(subscriptions);
         }
    });
};

module.exports = SubscriptionController;
