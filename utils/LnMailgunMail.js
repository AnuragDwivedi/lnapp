var config = require('../config');
const path = require('path');
var fs = require('fs');
var mailgun = require("mailgun-js");
var moment = require('moment-timezone');

var apiKey = process.env.MAILGUN_API_KEY || config.mailgunConfig.apiKey;
var domain = process.env.MAILGUN_DOMAIN || config.mailgunConfig.domain;
var mailgun = require('mailgun-js')({
	apiKey: apiKey,
	domain: domain
});
var logoPath = path.join(__dirname, '../public/images/logo-small.jpeg');
var orderTemplate = path.join(__dirname, '../public/email_templates/order_confirmation.html');
var mailOptions = {
	'from': '"Laundrynerds Support " <support@laundrynerds.com>', // sender address (who sends)
	'bcc': 'dwivedi.anurag007@gmail.com;ishantri@gmail.com; adi4uc8@yahoo.com; aditya.raj@laundrynerds.com;', // list of receivers (who receives)  
	'subject': '' // Subject line
};

var LnMailgunMail = function () {};

LnMailgunMail.prototype.sendOrderMail = function (orderDetails) {
	var orderDetails = orderDetails;
	// send mail with defined transport object
	mailOptions.text = 'Thanks for using Laundrynerds!\nHello ' + orderDetails.firstName + " " + orderDetails.lastName + ",\n Location: " + orderDetails.locality;

	fs.readFile(orderTemplate, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		mailOptions.subject = 'Laundrynerds Order Confirmation';
		data = replaceOrderParams(data, orderDetails);
		var data = {
			from: mailOptions.from,
			to: orderDetails.email,
			bcc: mailOptions.bcc,
			subject: mailOptions.subject,
			text: 'Testing some Mailgun awesomness!',
			//html: '<html><b>HTML version of the body</b> Image inline: <img src="cid:logo-small.jpeg"/></html>',
			html: data,
			inline: logoPath
		};

		mailgun.messages().send(data, function (error, body) {
			console.log(body);
		});
	});
};

function replaceOrderParams(data, orderDetails) {
	data = data
		.replace("{{customer-name}}", orderDetails.firstName + " " + (orderDetails.lastName ? orderDetails.lastName : ''))
		.replace("{{customer-mobile}}", orderDetails.mobile)
		.replace("{{order-number}}", orderDetails.orderId)
		.replace("{{date-today}}", moment().tz('Asia/Kolkata').format('MMM DD, YYYY'))
		.replace("{{pickup-date}}", moment.tz(orderDetails.pickupDate, 'Asia/Kolkata').format('MMM DD, YYYY'))
		.replace("{{pickup-slot}}", orderDetails.pickupSlot)
		.replace("{{address}}", orderDetails.fullAddress + " " + orderDetails.locality);

	return data;
}


module.exports = LnMailgunMail;
