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
//var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
//var mongoURLLabel = "";
var mongoURL = null;

var mongoConfig = config.mongoConfig;
//var mongoURL = (process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL) + process.env.OPENSHIFT_APP_NAME || 'mongodb://' + mongoConfig.server + ':' + mongoConfig.port + '/' + mongoConfig.db;

if (process.env.IS_PRODUCTION) {
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
}

console.log('process.env.DATABASE_SERVICE_NAME: ' + process.env.DATABASE_SERVICE_NAME);

//if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
//	var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
//		mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
//		mongoPort = process.env[mongoServiceName + '_SERVICE_PORT_MONGODB'],
//		mongoDatabase = process.env['MONGODB_DATABASE'],
//		mongoPassword = process.env['MONGODB_PASSWORD'],
//		mongoUser = process.env['MONGODB_USER'];
//
//	if (mongoHost && mongoPort && mongoDatabase) {
//		mongoURLLabel = mongoURL = 'mongodb://';
//		if (mongoUser && mongoPassword) {
//			mongoURL += mongoUser + ':' + mongoPassword + '@';
//		}
//		// Provide UI label that excludes user id and pw
//		mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
//		mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
//
//	}
//}
var db = null,
	dbDetails = new Object();

var initDb = function (callback) {
	if (mongoURL == null) return;
	//	var mongodb = require('mongodb');
	//	if (mongodb == null) return;
	//
	//	mongodb.connect(mongoURL, function (err, conn) {
	//		if (err) {
	//			callback(err);
	//			return;
	//		}
	//
	//		db = conn;
	//		dbDetails.databaseName = db.databaseName;
	//		dbDetails.url = mongoURLLabel;
	//		dbDetails.type = 'MongoDB';
	//
	//		console.log('Connected to MongoDB at: %s', mongoURL);
	//	});
	//mongoose.Promise = require('bluebird');
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

//app.get('/', function (req, res) {
//	// try to initialize the db on every request if it's not already
//	// initialized.
//	if (!db) {
//		initDb(function (err) {});
//	}
//	if (db) {
//		var col = db.collection('counts');
//		// Create a document with request IP and current time of request
//		col.insert({
//			ip: req.ip,
//			date: Date.now()
//		});
//		col.count(function (err, count) {
//			res.render('index.html', {
//				pageCountMessage: count,
//				dbInfo: dbDetails
//			});
//		});
//	} else {
//		res.render('index.html', {
//			pageCountMessage: null
//		});
//	}
//});
//
//app.get('/pagecount', function (req, res) {
//	// try to initialize the db on every request if it's not already
//	// initialized.
//	if (!db) {
//		initDb(function (err) {});
//	}
//	if (db) {
//		db.collection('counts').count(function (err, count) {
//			res.send('{ pageCount: ' + count + '}');
//		});
//	} else {
//		res.send('{ pageCount: -1 }');
//	}
//});

var routes = require('./router')(app, passport);

// error handling
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something bad happened!');
});

initDb(function (err) {
	console.log('Err: ' + err);
	console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
