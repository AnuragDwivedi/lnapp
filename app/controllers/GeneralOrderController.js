var ObjectId = require('mongoose').Types.ObjectId; 

var GeneralOrder = require('../models/GeneralOrderModel');
var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();
var UController = new require('./UserController');
var UserController = new UController();
var GeneralOrderController = function () {};
var when = require('when');

var ValidateAccess = require('../../utils/ValidateAccess');
var accessUtils = new ValidateAccess();
var zohoMail = require('../../utils/LnZohoMail');
var zohoLnMail = new zohoMail();
var mailgunMail = require('../../utils/LnMailgunMail');
var lnMail = new mailgunMail();

var msg91Sms = require('../../utils/LnSms');
var lnSms = new msg91Sms();

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
						locality: orderDetails.locality,
						address: orderDetails.fullAddress
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
					return next(error);
				});
			}
		}).catch(function (error) {
			console.log("Err2: " + error);
			// Handle any error from all above steps 
			return next(error);
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
			actualDeliveryDate: orderDetails.actualDeliveryDate,
			actualPickupDate: orderDetails.actualPickupDate,
			pickupSlot: orderDetails.pickupSlot,
			orderStatus: 'Received',
			itemTotal: orderDetails.itemTotal,
			gstAmount: orderDetails.gstAmount,
			discountAmount: orderDetails.discountAmount,
			totalAmount: orderDetails.totalAmount,
			paidAmount: orderDetails.paidAmount,
			paymentStatus: orderDetails.paymentStatus,
			paymentMode: orderDetails.paymentMode,
			totalQty: orderDetails.quantity,
			items: orderDetails.items,
			source: orderDetails.source,
			orderNumber: orderDetails.orderNumber,
			orderId: orderDetails.orderId,
			user: orderDetails.userId,
			assignedTo: null,
			comments: orderDetails.comments
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
			actualDeliveryDate: orderDetails.actualDeliveryDate,
			actualPickupDate: orderDetails.actualPickupDate,
			pickupSlot: orderDetails.pickupSlot,
			orderStatus: 'Received',
			itemTotal: orderDetails.itemTotal,
			gstAmount: orderDetails.gstAmount,
			discountAmount: orderDetails.discountAmount,
			totalAmount: orderDetails.totalAmount,
			paidAmount: orderDetails.paidAmount,
			paymentStatus: orderDetails.paymentStatus,
			paymentMode: orderDetails.paymentMode,
			totalQty: orderDetails.quantity,
			items: orderDetails.items,
			source: orderDetails.source,
			orderNumber: orderDetails.orderNumber,
			orderId: orderDetails.orderId,
			user: null,
			assignedTo: null
		});
	}

	if (req.user) {
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
				zohoLnMail.sendOrderMail(orderDetails);
				lnSms.sendOrderMessage(orderDetails);
				lnSms.sendOrderMessageToDeliveryTeam(orderDetails);
				return res.json(generalOrderObj);
			} else {
				lnSms.sendAdminOrderMessage(orderDetails);
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
	if (req.user && accessUtils.hasGetOrdersAccess(req.user)) {
		var orderSource = req.query.source;
		var isAdmin = req.query.isAdmin;
		GeneralOrder.
		find({
			source: orderSource,
			isAdminCreated: isAdmin,
			orderStatus: {
				$nin: ['Duplicate', 'Delivered', 'Cancelled']
			}
		}).
		populate('user assignedTo').
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
 * Get orders for pickup.
 *
 * @param {Object} res the response.
 */

GeneralOrderController.prototype.getOrdersByStatus = function (req, res, next) {
	console.log("Getting orders for status: " + req.query.status);
	var status = req.query.status ? req.query.status : 'Received';
	if (req.user && accessUtils.hasGetOrdersAccess(req.user)) {
		GeneralOrder.
		find({
			assignedTo: new ObjectId(req.user._id),
			orderStatus: status
		}).
		populate('user assignedTo').
		sort({
			pickupDate: 1
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
	if (req.user && accessUtils.hasGetOrdersAccess(req.user) && orderId !== null) {
		GeneralOrder.
		findById(orderId).
		populate('user assignedTo').
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
	if (req.user && accessUtils.hasGetOrdersAccess(req.user) && orderId !== null) {
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
			if (req.body.orderStatus && (req.body.orderStatus !== order.orderStatus)) {
				console.log("Updating status");
				order.orderStatus = req.body.orderStatus; // update the order's status
				hasUpdated = true;
			}
			if (req.body.discountAmount && req.body.discountAmount !== order.discountAmount) {
				console.log("Updating discount");
				order.discountAmount = req.body.discountAmount; // update the order's discount
				hasUpdated = true;
			}
			if (req.body.paidAmount && req.body.paidAmount !== order.paidAmount) {
				console.log("Updating paid");
				order.paidAmount = req.body.paidAmount; // update the order's paid amount
				hasUpdated = true;
			}
			if (req.body.paymentMode && req.body.paymentMode !== order.paymentMode) {
				console.log("Updating payment");
				order.paymentMode = req.body.paymentMode; // update the order's payment mode
				hasUpdated = true;
			}
			if (req.body.paymentStatus && req.body.paymentStatus !== order.paymentStatus) {
				console.log("Updating pay status");
				order.paymentStatus = req.body.paymentStatus; // update the order's payment status
				hasUpdated = true;
			}
			if (req.body.totalAmount && req.body.totalAmount !== order.totalAmount) {
				console.log("Updating total");
				order.totalAmount = req.body.totalAmount; // update the order's total amount
				hasUpdated = true;
			}
			if (req.body.itemTotal && req.body.itemTotal != order.itemTotal) {
				console.log("Updating itemtotal");
				order.itemTotal = req.body.itemTotal; // update the order's item total
				hasUpdated = true;
			}
			if (req.body.gstAmount && req.body.gstAmount != order.gstAmount) {
				console.log("Updating gst");
				order.gstAmount = req.body.gstAmount; // update the order's gst
				hasUpdated = true;
			}
			if (req.body.totalQty && req.body.totalQty != order.totalQty) {
				console.log("Updating total q");
				order.totalQty = req.body.totalQty; // update the order's quantity
				hasUpdated = true;
			}
			if (req.body.items) {
				console.log("Updating items");
				order.items = req.body.items; // update the order's items
				hasUpdated = true;
			}
			if (req.body.assignedTo) {
				console.log("Updating assigned to");
				order.assignedTo = req.body.assignedTo; // update the order's assigned to
				hasUpdated = true;
			}
			if (req.body.actualPickupDate) {
				console.log("Updating actual pickup date");
				order.actualPickupDate = req.body.actualPickupDate; // update the order's actual pickup date
				order.orderStatus = req.body.status;
				hasUpdated = true;
			}
			if (req.body.deliveryDate) {
				console.log("Updating delivery date");
				order.deliveryDate = req.body.deliveryDate; // update the order's delivery date
				hasUpdated = true;
			}
			if (req.body.actualDeliveryDate) {
				console.log("Updating actual delivery date");
				order.actualDeliveryDate = req.body.actualDeliveryDate; // update the order's actual delivery date
				order.orderStatus = req.body.status;
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
