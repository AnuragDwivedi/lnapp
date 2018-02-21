const http = require('http');
var config = require('../config');
var moment = require('moment-timezone');

var smsOptions = {
	baseUrl: process.env.MSG91_BASE_URL || config.msg91.baseUrl,
	authKey: process.env.MSG91_AUTH_KEY || config.msg91.authKey,
	sender: process.env.MSG91_SENDER || config.msg91.sender,
	deliveryTeam: process.env.MSG91_DELIVERY_TEAM || config.msg91.deliveryTeam
};
var LnSms = function () {};

LnSms.prototype.sendOrderMessage = function (orderDetails) {
	var url = smsOptions.baseUrl + "?authkey=" + smsOptions.authKey + "&&route=4&sender=" + smsOptions.sender + "&mobiles=" + orderDetails.mobile + "&message=" + getOrderMessageBody(orderDetails);
	http.get(url, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			console.log(data);
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
};

LnSms.prototype.sendOrderMessageToDeliveryTeam = function (orderDetails) {
	var url = smsOptions.baseUrl + "?authkey=" + smsOptions.authKey + "&&route=4&sender=" + smsOptions.sender + "&mobiles=" + smsOptions.deliveryTeam + "&message=" + getOrderMessageBodyForDeliveryTeam(orderDetails);
	console.log("URL: " + url);
	http.get(url, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			console.log(data);
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
};

LnSms.prototype.sendAdminOrderMessage = function (orderDetails) {
	var url = smsOptions.baseUrl + "?authkey=" + smsOptions.authKey + "&route=4&sender=" + smsOptions.sender + "&mobiles=" + orderDetails.mobile + "&message=" + getAdminOrderMessageBody(orderDetails);
	console.log("URL: " + url);
	http.get(url, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			console.log(data);
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
};

function getOrderMessageBody(orderDetails) {
	var messageBody = "Hello" +
		" " + orderDetails.firstName + " " + (orderDetails.lastName ? orderDetails.lastName : '') +
		",%0a" + "Thanks for placing an order with Laundrynerds.%0a" +
		"" + "Your pickup is scheduled on " + moment.tz(orderDetails.pickupDate, 'Asia/Kolkata').format('MMM DD') +
		" for the " + orderDetails.pickupSlot + " time slot" +
		".%0a" + "Feel free to contact us on 8142181426 for any queries.%0a" +
		"" + "Visit http://www.laundrynerds.com/pricelist.html for detailed pricelist. %0aThanks!";

	return messageBody;
};

function getOrderMessageBodyForDeliveryTeam(orderDetails) {
	var messageBody = "Hello,%0a" +
		"Customer: " + orderDetails.firstName + " " + (orderDetails.lastName ? orderDetails.lastName : '') + ",%0a" +
		"Contact: " + orderDetails.mobile + ",%0a" +
		"Pickup date: " + moment.tz(orderDetails.pickupDate, 'Asia/Kolkata').format('MMM DD') + ",%0a" +
		"Pickup slot: " + orderDetails.pickupSlot + ",%0a" +
		"Address: " + orderDetails.fullAddress + " " + orderDetails.locality + ",%0a" +
		"Do the on time pickup. Thanks!";

	return messageBody;
};

function getAdminOrderMessageBody(orderDetails) {
	var messageBody = "Hello" +
		" " + orderDetails.firstName + " " + (orderDetails.lastName ? orderDetails.lastName : '') +
		",%0a" + "Thanks for placing an order with Laundrynerds.%0a" +
		"Your order is received at our washing store and will be done and delivered on priority." +
		"%0a" + "Feel free to contact us on 8142181426 for any queries.%0a" +
		"" + "Visit http://www.laundrynerds.com/pricelist.html for detailed pricelist. %0aThanks!";

	return messageBody;
};

module.exports = LnSms;
