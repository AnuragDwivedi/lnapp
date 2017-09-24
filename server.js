// ===========================================================================
// app.js
// @description: Setup server, register routes and swagger, start up express server.
// @authors: Anurag Dwivedi
// ===========================================================================

// =========================================================================
// Load Modules
// =========================================================================
var express = require('express'),
	fs = require('fs'),
	app = express(),
	eps = require('ejs'),
	morgan = require('morgan'),
	config = require('./config'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	cookieParser = require('cookie-parser'),
	passport = require('passport'),
	session = require('express-session'),
	uuid = require('node-uuid'),
	LocalStrategy = require('passport-local').Strategy;
//var CircularJSON = require('circular-json');

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

//=========================================================================
// NodeJS Config
//=========================================================================
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || config.originPort,
	ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || config.origin;

// =========================================================================
// MongoDB Config
// =========================================================================
var mongoURL = null,
	mongoConfig = config.mongoConfig;

mongoURL = process.env.MONGODB_URI ? process.env.DATABASE_URL : ('mongodb://' + mongoConfig.server + ':' + mongoConfig.port + '/' + mongoConfig.db);

/*if (process.env.IS_PRODUCTION) {
	var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
		mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
		mongoPort = process.env[mongoServiceName + '_SERVICE_PORT_MONGODB'],
		mongoDatabase = process.env['MONGODB_DATABASE'],
		mongoPassword = process.env['MONGODB_PASSWORD'],
		mongoUser = process.env['MONGODB_USER'];
	mongoURL = 'mongodb://';
	mongoURL += mongoUser + ':' + mongoPassword + '@';
	mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
	console.log("Mongo URL: " + mongoURL);
} else {
	mongoURL = 'mongodb://' + mongoConfig.server + ':' + mongoConfig.port + '/' + mongoConfig.db;
}*/

var db = null,
	dbDetails = new Object();

var initDb = function (callback) {
	mongoose.connect(mongoURL, {
		useMongoClient: true
	}, function (err) {
		if (err) {
			console.log('Err: ' + err);
			callback(err);
		}
		return;
	});
};

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
app.use(bodyParser.urlencoded({
	extended: true
}));

// =========================================================================
// Passport Config
// =========================================================================
var User = require('./app/models/UserModel');

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


// =========================================================================
// Application routes config
// =========================================================================
var routes = require('./router')(app, passport);

// error handling
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something bad happened!');
});


// =========================================================================
// DB Initialization
// =========================================================================
initDb(function (err) {
	console.log('Err: ' + err);
	console.log('Error connecting to Mongo. Message:\n' + err);
});

console.log("DB: " + process.env.DATABASE_URL);

// =========================================================================
// Server Start
// =========================================================================
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
