// ===========================================================================
// router.js
// @description: Setup api routes.
// @authors: Laundrynerds
// ===========================================================================
var express = require('express');
var session = require('express-session');
var config = require('./config');
var router = require('express').Router();
var compression = require('compression');
//var CircularJSON = require('circular-json');
module.exports = function (app, passport) {
	'use strict';

	// =========================================================================
	// ROUTER CONFIG
	// =========================================================================

	// Enable CORS (Cross-origin resource sharing)
	/*app.use(function (req, res, next) {

	    res.header('Access-Control-Allow-Origin', req.headers.origin); // wide open!
	    res.header('Access-Control-Allow-Credentials', 'true');
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	    res.header('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');

	    // intercept OPTIONS method
	    if (req.method == 'OPTIONS') {
	        res.send(200);
	    } else {
	        next();
	    }

	});*/

	// Session
	app.use(session({
		secret: config.key,
		resave: true,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());

	// gzip static content
	app.use('/', compression({
		threshold: 10,
		filter: function (req, res) {
			var ct = res.get('content-type');
			return /json|text|javascript|image\/jpeg|image\/png|image\/svg\+xml|application\/x-font-ttf|application\/vnd\.ms-opentype|application\/vnd\.ms-fontobject/.test(res.getHeader('Content-Type'));
		}
	}));

	// Authentication for admin
	app.use('/admin', function (req, res, next) {
		//console.log("Whole Request: " + CircularJSON.stringify(req));
		if (req.path.indexOf('/login.html') === -1 && (req.user === undefined || req.user.role !== 'Admin')) {
			console.log('Inside Auth Fail');
			if ((req.originalUrl.lastIndexOf("/") + 1) === req.originalUrl.length) {
				res.redirect('login.html?redirectUrl=' + req.url);
			} else {
				res.redirect('admin/login.html?redirectUrl=' + req.url);
			}
		}
		next();
	});

	// =========================================================================
	// ROUTES
	// =========================================================================
	app.use('/', express.static('public', {
		maxAge: 21600000
	}));
	app.use('/blog', express.static('public/blog', {
		maxAge: 21600000
	}));
	app.use('/404', express.static('public/404'));
	app.use('/admin', express.static('public/admin'));

	app.use('/api/page', require('./app/routes/page'));
	app.use('/api/pricelist', require('./app/routes/pricelist'));
	app.use('/api/subscription', require('./app/routes/subscription'));
	app.use('/api/generalorder', require('./app/routes/generalorder'));
	app.use('/api/login', require('./app/routes/login'));
	app.use('/api/user', require('./app/routes/user'));

	app.get('*', function (req, res, next) {
		var err = new Error();
		err.status = 404;
		next(err);
	});

	// handling 404 errors
	app.use(function (err, req, res, next) {

		if (err.status !== 404) {
			return next();
		} else if (err.status === 404) {
			res.redirect('/404');
		}
	});

	return router;

};
