var GeneralOrder = require('../models/GeneralOrderModel');
var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();
var UController = new require('./UserController');
var UserController = new UController();
var GeneralOrderController = function () {};
var when = require('when');

var mail = require('../../utils/LnMail');
var lnMail = new mail();

/**
 * Save a new order.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */

GeneralOrderController.prototype.createGeneralOrder = function (req, res, next) {
	console.log("Inside generalorder create controller\n");
	if (req.body) {

		DbSequenceController.next('order').then(function (result) {
			if (!result && !result.next) {
				result.next = null;
			}
			var orderDetails = req.body;
			orderDetails.orderId = result.next;

			if (orderDetails.userId) {
				console.log("User ID passed in request: " + orderDetails.userId);
				createOrder(orderDetails, req, res, next, true);
			} else {
				var userObj = {
					firstName: orderDetails.firstName,
					lastName: orderDetails.lastName,
					gender: orderDetails.gender,
					mobile: orderDetails.mobile,
					email: orderDetails.email,
					address: {
						city: 'Hyderabad',
						state: 'Telanagana',
						country: 'India',
						location: orderDetails.fullAddress + " \n" + orderDetails.locality
					},
					created: new Date(),
					lastUpdated: new Date()
				};
				if (req.user) {
					userObj.createdBy = req.user.email;
					userObj.updatedBy = req.user.email;
				} else {
					userObj.createdBy = orderDetails.email;
					userObj.updatedBy = orderDetails.email;
				}

				// Save user
				UserController.createUserFromOrder(userObj).then(function (user) {
					var userId = user._id ? user._id : null;
					orderDetails.userId = userId;
					createOrder(orderDetails, req, res, next, userId ? true : false);
				}).catch(function (error) {
					console.log("Err1: " + error);
					orderDetails.userId = null;
					createOrder(orderDetails, req, res, next, false);
					// Handle any error from all above steps
					return next(err);
				});
			}
		}).catch(function (error) {
			console.log("Err2: " + error);
			// Handle any error from all above steps 
			return next(err);
		});
	}
};

/**
 * Create order.
 * Private
 * @param {Object} res the response.
 */
function createOrder(orderDetails, req, res, next, isUserIdPresent) {
	var generalOrderObj;
	if (isUserIdPresent) {
		generalOrderObj = new GeneralOrder({
			pickupDate: orderDetails.pickupDate,
			deliveryDate: orderDetails.deliveryDate,
			pickupSlot: orderDetails.pickupSlot,
			orderStatus: 'Received',
			totalAmount: orderDetails.amount,
			totalQty: orderDetails.quantity,
			items: orderDetails.items,
			source: orderDetails.source,
			orderNumber: orderDetails.orderNumber,
			orderId: orderDetails.orderId,
			user: orderDetails.userId
		});
	} else {
		generalOrderObj = new GeneralOrder({
			firstName: orderDetails.firstName,
			lastName: orderDetails.lastName,
			gender: orderDetails.gender,
			mobile: orderDetails.mobile,
			email: orderDetails.email,
			pickupDate: orderDetails.pickupDate,
			deliveryDate: orderDetails.deliveryDate,
			pickupSlot: orderDetails.pickupSlot,
			orderStatus: 'Received',
			totalAmount: orderDetails.amount,
			totalQty: orderDetails.quantity,
			items: orderDetails.items,
			source: orderDetails.source,
			orderNumber: orderDetails.orderNumber,
			orderId: orderDetails.orderId,
			user: null
		});
	}

	if (req.user) {
		console.log("Found User");
		generalOrderObj.createdBy = req.user.email;
		generalOrderObj.updatedBy = req.user.email;
		generalOrderObj.isAdminCreated = true;
	} else {
		generalOrderObj.createdBy = orderDetails.email;
		generalOrderObj.updatedBy = generalOrderObj.createdBy = orderDetails.email;
		generalOrderObj.isAdminCreated = false;
	}

	generalOrderObj.save(function (err, pl) {
		if (err) {
			console.log("Err: " + err);
			return next(err);
		} else {
			if (orderDetails.source == "Online" && !generalOrderObj.isAdminCreated) {
				// send mail with defined transport object
				lnMail.sendOrderMail(orderDetails);
				return res.json(generalOrderObj);
			} else {
				return res.json(generalOrderObj);
			}
		}
	});
};


/**
 * Get all orders.
 *
 * @param {Object} res the response.
 */

GeneralOrderController.prototype.getGeneralOrders = function (req, res, next) {
	console.log("Getting all the orders");
	if (req.user && req.user.role === 'Admin') {
		var orderSource = req.query.source;
		var isAdmin = req.query.isAdmin;
		console.log(isAdmin);
		GeneralOrder.
		find({
			source: orderSource,
			isAdminCreated: isAdmin,
			orderStatus: {
				$nin: ['Duplicate', 'Delivered', 'Cancelled']
			}
		}).
		populate('user').
		//select('-_id firstName lastName gender orderStatus mobile email pickupDate pickupSlot locality fullAddress').
		sort({
			deliveryDate: 1
		}).
		exec(function (err, generalOrders) {
			if (err) {
				return next(err);
			} else {
				return res.json(generalOrders);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}

};

/**
 * Get order details.
 *
 * @param {Object} req the request object.
 */

GeneralOrderController.prototype.getGeneralOrderDetails = function (req, res, next) {
	var orderId = req.params.orderId;
	if (req.user && req.user.role === 'Admin' && orderId !== null) {
		console.log("Getting the order details for id: " + orderId);
		GeneralOrder.
		findById(orderId).
		populate('user').
		exec(function (err, order) {
			if (err) {
				return next(err);
			}
			if (!order) {
				return res.status(404).json({
					error: 'Order not found'
				});
			} else {
				return res.json(order);
			}
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}

};

/**
 * Update an order.
 *
 * @param {Object} req the request object.
 */

GeneralOrderController.prototype.updateGeneralOrders = function (req, res, next) {
	var orderId = req.params.orderId;
	if (req.user && req.user.role === 'Admin' && orderId !== null) {
		console.log("Updating the order for id: " + orderId);
		GeneralOrder.findById(orderId, function (err, order) {
			if (err) {
				return next(err);
			}
			if (!order) {
				return res.status(404).json({
					error: 'Order not found'
				});
			}

			var hasUpdated = false;
			if (req.body.orderStatus !== order.orderStatus) {
				order.orderStatus = req.body.orderStatus; // update the order's status
				hasUpdated = true;
			}


			// Updating who columns
			if (hasUpdated) {
				order.lastUpdated = new Date();
				order.updatedBy = req.user.email;
			}

			// save the updated order
			order.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(order);
				}
			});
		});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}

};

module.exports = GeneralOrderController;
