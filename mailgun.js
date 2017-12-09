const path = require('path');
var fs = require('fs');
var mailgun = require("mailgun-js");
var moment = require('moment-timezone');

var api_key = 'key-0caedc90cc87ae42444a4a9c89f7b1ff';
var DOMAIN = 'laundrynerds.com';
var mailgun = require('mailgun-js')({
	apiKey: api_key,
	domain: DOMAIN
});

var filepath = path.join(__dirname, 'public/images/logo-small.jpeg');
var template = path.join(__dirname, 'public/email_templates/order_confirmation.html');

fs.readFile(template, 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	console.log(moment().tz('Asia/Kolkata').format('MMM DD, YYYY'));
	var data = {
		from: 'Laundrynerds Order <no-reply@laundrynerds.com>',
		to: 'dwivedi.anurag007@gmail.com',
		bcc: 'dwivedi.anurag007@gmail.com',
		subject: 'Hello',
		text: 'Testing some Mailgun awesomness!',
		//html: '<html><b>HTML version of the body</b> Image inline: <img src="cid:logo-small.jpeg"/></html>',
		html: data,
		inline: filepath
	};

	//	mailgun.messages().send(data, function (error, body) {
	//		console.log(body);
	//	});
});
