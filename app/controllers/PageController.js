var Page = require('../models/PageModel');
var Subscriber = require('../models/SubscriberModel');
var PageController = function(){};

/**
 * Saves Page Hits
 */

PageController.prototype.pageHit = function(req, res, next) {
  console.log("Inside page hit");
  var pageHitCookie = req.cookies['laundrynerds.com'];
  var requestBody = req.body;
  if(pageHitCookie) {
	  // Record already exists, update it
	  Page.findById(pageHitCookie, function(err, page) {
		  if(err) {
			  createNewPageHit(req, res, next);
		  } else if (page){
			  if(requestBody.latitude && requestBody.longitude && page.latitude && page.longitude) {
				  page.latitude = requestBody.latitude;
				  page.longitude = requestBody.longitude;
			  }
			  if(requestBody.address.postalCode) {
				  page.postalCode = requestBody.address.postalCode;
				  page.locality = requestBody.address.locality;
				  page.city = requestBody.address.city;
				  page.state = requestBody.address.state;
				  page.country = requestBody.address.country;
				  page.fullAddress = requestBody.address.fullAddress;
			  }
			  
			  page.lastHitDateTime = Date.now();
			  page.hitCount = page.hitCount + 1;
			  
			// save the page
		    page.save();
		    res.send("OK");
		  }
	  });
  } else {
	  // Create new page hit record
	  createNewPageHit(req, res, next);
  }
};

var createNewPageHit = function(req, res, next) {
	var pageHit = new Page(req.body);
	
	pageHit.save(function(err, page) {
		if(err) {
			res.send("Failed to save page hit");
		} else {
			// Set cookiee for 5 years
			console.log(page.id);
			res.cookie('laundrynerds.com', page.id, { expires: new Date(Date.now() + 5*365*24*60*60*1000), httpOnly: true });
			res.send("OK");
		}
	});
}


/**
 * Saves subscribers
 */

PageController.prototype.subscribe = function(req, res, next) {
  console.log("Inside subscribe");
  var subscribeCookie = req.cookies['subscribe.laundrynerds.com'];
  var requestBody = req.body;
  if(!subscribeCookie || subscribeCookie !== requestBody.email) {
	  // Subscribe the user
	  Subscriber.findOne({email: requestBody.email}, function (err, results) {
		  if(err) {
			res.send("Error");
		  } else if(results) {
			  res.cookie('subscribe.laundrynerds.com', requestBody.email);
			  res.send("OK");
		  } else {
			var subscribeUser = new Subscriber(requestBody);
			
			subscribeUser.save(function(err, result) {
				if (err) {
					res.send("Error");
				} else {
					res.cookie('subscribe.laundrynerds.com', requestBody.email);
					res.send("OK");
				}
			});
		  }
	  });
  } else {
	  // Do nothing
	  res.send("OK");
  }
};

module.exports = PageController;
