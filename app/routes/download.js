var router = require('express')();
var Controller = require('../controllers/DownloadController');
var DownloadController = new Controller();

/**
 * Downlaod commercial invoice.
 *
 * endpoint: `/download/commercial`
 * method: POST
 *
 * @return PDF File.
 * @api public
 */

 router.post('/commercial', DownloadController.downloadCommercialInvoice);

module.exports = router;
