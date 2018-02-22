var Pricelist = require('../models/PricelistModel');
var PricelistController = function () {};
var when = require('when');

/**
 * Save a new pricelist.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */

PricelistController.prototype.createPricelist = function (req, res, next) {
	console.log("Inside create pricelist\n");
	if (req.user) {
		if (req.body) {
			var pricelist = req.body;
			var priceListObj = new Pricelist({
				itemName: pricelist.itemName,
				itemDisplayName: pricelist.itemDisplayName,
				laundryPrice: pricelist.laundryPrice,
				drycleanPrice: pricelist.drycleanPrice,
				ironPrice: pricelist.ironPrice
			});
			if (pricelist.pricelistType) {
				priceListObj.pricelistType = pricelist.pricelistType;
			}

			Pricelist.findOne({
				itemName: pricelist.itemName
			}, function (err, results) {
				if (err) return next(err);
				if (results) {
					res.send('A item with item name ' + priceList.itemName + ' already exists.', 500);
				} else {
					console.log("Saving pricelist");
					priceListObj.save(function (err, pl) {
						if (err) {
							console.log("Err: " + err);
							return next(err);
						} else {
							return res.json(priceListObj);
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
 * Get pricelist for per piece and subscription.
 *
 * @param {Object} res the response.
 */

PricelistController.prototype.getPricelists = function (req, res, next) {
	console.log("getting all the pricelists");
	//    var pricelistObj = {};
	//    
	//    var perPiecePromise = Pricelist.find().
	//    	select('-_id itemName itemDisplayName pricelistType laundryPrice drycleanPrice ironPrice itemCategories').
	//    	where('pricelistType').equals('per_piece').
	//    	exec();
	//    var subscriptionPromise = Pricelist.find().
	//    	select('-_id itemName itemDisplayName pricelistType laundryPrice drycleanPrice ironPrice itemCategories').
	//    	where('pricelistType').equals('subscription').
	//    	exec();
	//    
	//    when.all([perPiecePromise, subscriptionPromise]).then(function(pricelists) {
	//        console.log("\n1" + pricelists);
	//        pricelistObj["perPiece"] = pricelists[0];
	//        pricelistObj["subscription"] = pricelists[1];
	//        
	//        return res.json(pricelistObj);
	//    }, function(err) {
	//        console.log("\n2" + err);
	//        return next(err);
	//    });
	Pricelist.
	find().
	select('_id itemName itemDisplayName pricelistType laundryPrice drycleanPrice ironPrice itemCategories').
	exec(function (err, pricelists) {
		if (err) {
			return next(err);
		} else {
			return res.json(pricelists);
		}
	});
};


PricelistController.prototype.updatePricelistById = function (req, res, next) {
	var id = req.params.id;
	console.log("updating the pricelists for id: " + id);
	if (req.user && req.user.role === 'Admin' && id !== null) {
		Pricelist.findById(id, function (err, item) {
			if (err) {
				return next(err);
			}
			if (!item) {
				return res.status(404).json({
					error: 'Item not found'
				});
			}

			var hasUpdated = false;
			if (req.body.laundryPrice !== item.laundryPrice) {
				item.laundryPrice = req.body.laundryPrice;
				hasUpdated = true;
			}
			if (req.body.drycleanPrice !== item.drycleanPrice) {
				item.drycleanPrice = req.body.drycleanPrice;
				hasUpdated = true;
			}
			if (req.body.ironPrice !== item.ironPrice) {
				item.ironPrice = req.body.ironPrice;
				hasUpdated = true;
			}

			// Updating who columns
			if (hasUpdated) {
				item.lastUpdated = new Date();
				item.updatedBy = req.user.email;
			}

			// save the updated order
			item.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(item);
				}
			});
		});
	} else {
		return res.send(401, "Unauthorized");
	}
};

module.exports = PricelistController;
