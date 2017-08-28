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
var cookieParser = require('cookie-parser');
var uuid = require('node-uuid');

// app vars
var app = express(); // define our app using express

var config = require('./config');
var User = require('./app/models/UserModel');

//=========================================================================
// NodeJS Config
//=========================================================================
var ipaddress = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || config.origin;
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || config.originPort;

//mongoose.connect(mongoDbUrl);

// =========================================================================
// Express Config
// =========================================================================

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var routes = require('./router')(app);

// =========================================================================
// Server Start
// =========================================================================

app.listen(port, ipaddress);
console.log('Express available at ' + ipaddress + ':' + port);
module.exports = app;
