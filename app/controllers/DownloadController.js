var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var html = fs.readFileSync('./public/downloadable-views/invoice.html', 'utf8');
const path = require('path');
var handlebars = require('handlebars');

var options = {
	format: "A3",
	orientation: "portrait",
	border: "10mm",
	"base": "file:///" + path.resolve('./public') + "/"
};

handlebars.registerHelper("inc", function(value, options) {
	return parseInt(value) + 1;
});

handlebars.registerHelper("gst", function(value, options) {
	return parseInt(value) * 9 / 100;
});

handlebars.registerHelper("total", function(value, options) {
	var total = parseInt(value) + (parseInt(value) * 18 / 100);
	return Math.round(total * 100) / 100;
});

var DownloadController = function () {};

/**
 * Downlaod invoice commercial
 */
DownloadController.prototype.downloadCommercialInvoice = function (req, res, next) {
	console.log("Inside commercial invoice downlaod controller: " + JSON.stringify(req.body));

	if (true || req.user && req.user.role === 'Admin' && leadId != null) {
		var document = {
			type: 'buffer', // 'file' or 'buffer'
			template: html,
			context: req.body,
			path: "./output.pdf" // it is not required if type is buffer
		};

		pdf.create(document, options)
			.then(doc => {
				console.log('Doc generated');
				res.setHeader('Content-type', 'application/pdf');
				res.setHeader('Content-disposition', 'attachment; filename=' + req.body.lead.name + '.pdf');
				//res.type('pdf');
				res.end(doc, 'binary');
			})
			.catch(error => {
				console.error('Commercial doc error: ' + error);
			});
	} else {
		console.log("401");
		return res.send(401, "Unauthorized");
	}
};

module.exports = DownloadController;