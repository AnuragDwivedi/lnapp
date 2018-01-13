const http = require('http');
var config = require('../config');
var moment = require('moment-timezone');

var smsOptions = {
	baseUrl: process.env.MSG91_BASE_URL || config.msg91.baseUrl,
	authKey: process.env.MSG91_AUTH_KEY || config.msg91.authKey,
	sender: process.env.MSG91_SENDER || config.msg91.sender
};
var LnSms = function () {};

LnSms.prototype.sendOrderMessage = function (orderDetails) {
	var url = smsOptions.baseUrl + "?authkey=" + smsOptions.authKey + "&&route=4&sender=" + smsOptions.sender + "&mobiles=" + orderDetails.mobile + "&message=" + getOrderMessageBody(orderDetails);
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

	console.log("Msg: " + messageBody);
	return messageBody;
};

module.exports = LnSms;
