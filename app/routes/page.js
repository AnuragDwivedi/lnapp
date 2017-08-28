var router = require('express')();
var Controller = require('../controllers/PageController');
var PageController = new Controller();

/**
 * Save page hit count with location.
 *
 * endpoint: `/page`
 * method: POST
 *
 * @return Cookiee for page hit with key: laundrynerds.com.
 * @api public
 */

 router.post('/', PageController.pageHit);
 
 /**
  * Subscribe the user.
  *
  * endpoint: `/page`
  * method: POST
  *
  * @return subscribed user and cookie.
  * @api public
  */

  router.post('/subscribe', PageController.subscribe);

module.exports = router;
