var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var html = fs.readFileSync('./public/downloadable-views/invoice.html', 'utf8');

var options = {
	format: "A3",
	orientation: "portrait",
	border: "10mm"
};

var DownloadController = function () {};

/**
 * Downlaod invoice commercial
 */
DownloadController.prototype.downloadCommercialInvoice = function (req, res, next) {
	console.log("Inside commercial invoice downlaod controlelr");
	if (true || req.user && req.user.role === 'Admin' && leadId != null) {
		var document = {
			type: 'buffer', // 'file' or 'buffer'
			template: html,
			context: {
				invoice: 'LN-ABC-12',
				lead: {
					name: 'Pravallika',
					gst: 'SHuihd12hj'
				}
			},
			path: "./output.pdf" // it is not required if type is buffer
		};

		pdf.create(document, options)
			.then(doc => {
				res.send(doc);
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