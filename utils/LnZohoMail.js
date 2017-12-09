var config = require('../config');
var nodemailer = require('nodemailer');

var LnZohoMail = function () {};

// Create the transporter with the required configuration for Gmail
// change the user and pass !
var transporter = nodemailer.createTransport({
	host: process.env.ZOHO_HOSTNAME || config.zohoConfig.host,
	port: process.env.ZOHO_PORT || config.zohoConfig.port,
	secure: true, // use SSL
	auth: {
		user: process.env.ZOHO_USERNAME || config.zohoConfig.user,
		pass: process.env.ZOHO_PASSWORD || config.zohoConfig.pass
	}
});
// setup e-mail data, even with unicode symbols
var mailOptions = {
	'from': '"Laundrynerds Support " <support@laundrynerds.com>', // sender address (who sends)
	to: 'dwivedi.anurag007@gmail.com; ishantri@gmail.com; adi4uc8@yahoo.com; aditya.raj@laundrynerds.com;', // list of receivers (who receives)
	subject: 'New Order received' // Subject line
};

LnZohoMail.prototype.sendOrderMail = function (orderDetails) {
	// send mail with defined transport object
	mailOptions.text = 'Hello Anurag,\n Name: ' + orderDetails.firstName + " " + orderDetails.lastName + "\n Location: " + orderDetails.locality; // plaintext body
	mailOptions.html = '<b>Hello Anurag </b>' +
		'<br> Name: ' + orderDetails.firstName + " " + orderDetails.lastName +
		'<br> Contact: ' + orderDetails.mobile +
		'<br> Location: ' + orderDetails.locality +
		'<br> Address: ' + orderDetails.fullAddress +
		'<br> Pickup Date: ' + orderDetails.pickupDate +
		'<br> Pickup Slot: ' + orderDetails.pickupSlot; // html body
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			return console.log("Mail error: " + error);
			//return next(error);
		} else {
			console.log('Message sent: ' + info.response + '\n Order Obj: ' + generalOrderObj);
			//return res.json(generalOrderObj);
		}
	});
};


module.exports = LnZohoMail;
