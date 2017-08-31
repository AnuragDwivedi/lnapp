// Session Auth Route

var router = require('express')();
var Controller = require('../controllers/SessionController');
var SessionController = new Controller();

/**
 * Login to the service.
 *
 * endpoint: `/login`
 * method: POST
 *
 * @param {String} username
 * @param {String} password
 *
 * @return {Object} The logged in user.
 * @api public
 */

 router.post('/', SessionController.login);
 router.get('/fb', SessionController.loginfb);
 router.get('/', function(req, res, next) {
	 console.log("In login");
	 res.json({"test": "1"});
	 
 });

module.exports = router;
