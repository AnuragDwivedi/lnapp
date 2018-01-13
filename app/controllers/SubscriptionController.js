var Subscription = require('../models/SubscriptionModel');
var SubscriptionController = function () {};

/**
 * Save a new subscription.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */

SubscriptionController.prototype.createSubscription = function (req, res, next) {
	console.log("Inside create subscription\n");
	if (req.user) {
		if (req.body) {
			var subscription = req.body;
			var subscriptionObj = new Subscription({
				packageName: subscription.packageName,
				packageDisplayName: subscription.packageDisplayName,
				price: subscription.price,
				numberOfClothes: subscription.numberOfClothes,
				numberOfPickups: subscription.numberOfPickups,
				description: subscription.description,
				duration: subscription.duration,
				category: subscription.category,
				isEnabled: subscription.isEnabled,
				createdBy: req.user.email,
				updatedBy: req.user.email
			});

			if (subscription.items) {
				subscriptionObj.items = subscription.items;
			}

			Subscription.findOne({
				packageName: subscription.packageName
			}, function (err, results) {
				if (err) return next(err);
				if (results) {
					res.send('A subscription with name ' + subscription.packageName + ' already exists.', 500);
				} else {
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
	} else {
		res.send(401);
	}
};


/**
 * Get subscriptions.
 *
 * @param {Object} res the response.
 */

SubscriptionController.prototype.getSubscriptions = function (req, res, next) {
	var findCondition = req.query.isEnabled === undefined ? {} : {
		isEnabled: req.query.isEnabled
	};
	Subscription.
	find(findCondition).
	select('_id packageName packageDisplayName subscriptionType price numberOfClothes numberOfPickups description category isEnabled duration').
	sort({
		lastUpdated: -1
	}).
	exec(function (err, subscriptions) {
		if (err) {
			return next(err);
		} else {
			return res.json(subscriptions);
		}
	});
};

SubscriptionController.prototype.updateSubscription = function (req, res, next) {
	if (req.user) {
		Subscription.findById(req.params.subId, function (err, subscription) {
			if (err) {
				return next(err);
			}

			// Merge two objects
			Object.assign(subscription, req.body);
			subscription.lastUpdated = new Date();
			if (req.user) {
				subscription.updatedBy = req.user.email;
				subscription.createdBy ? subscription.createdBy : req.user.email;
			}

			// save the user
			subscription.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(subscription);
				}
			});

		});

	} else {
		res.send(401);
	}
};


module.exports = SubscriptionController;
