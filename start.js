// ===========================================================================
// app.js
// @description: Setup server, register routes and swagger, start up express server.
// @authors: Anurag Dwivedi
// ===========================================================================

// packages
// =========================================================================
// Load Modules
// =========================================================================
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var uuid = require('node-uuid');
var LocalStrategy = require('passport-local').Strategy;

// app vars
var app = express(); // define our app using express

var config = require('./config');
var User = require('./app/models/UserModel');

//=========================================================================
// NodeJS Config
//=========================================================================
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || config.origin;
var port      = process.env.OPENSHIFT_NODEJS_PORT || config.originPort;

// =========================================================================
// MongoDB Config
// =========================================================================
var mongoConfig = config.mongoConfig;
var mongoDbUrl = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://' + mongoConfig.server + ':' + mongoConfig.port + '/' + mongoConfig.db;
mongoose.connect(mongoDbUrl);

// =========================================================================
// Express Config
// =========================================================================

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	genid: function (req) {
		return uuid.v4(); // use UUIDs for session IDs
	},
	secret: 'ln-private-sc-key',
	rolling: true,
	saveUninitialized: false,
	resave: true,
	cookie: {
		maxAge: 3600000
	}
}));
app.use(bodyParser.urlencoded({extended: true}));

// =========================================================================
// Passport Config
// =========================================================================

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

// Local strategy
passport.use(new LocalStrategy(function (username, password, done) {
	User.findOne({
		username: username
	}, function (err, user) {
		if (err) {
			return done(err);
		} else if (!user) {
			return done(null, false, {
				message: 'Incorrect username.'
			});
		} else {
			user.comparePassword(password, function (err, isMatch) {
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Incorrect password.'
					});
				}
			});
		}
	});
}));


var routes = require('./router')(app, passport);

// =========================================================================
// Server Start
// =========================================================================

app.listen(port, ipaddress);
console.log('Express available at ' + ipaddress +':'+ port);
console.log('MongoDB available at ' + mongoDbUrl);
module.exports = app;
