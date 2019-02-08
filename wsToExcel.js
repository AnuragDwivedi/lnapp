// http://www.laundrynerds.com/api/pricelist
var https = require('https');

var options = {
    host: 'laundrynerds.com',
	path: '/api/pricelist',
	port: '80',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };


var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
	  console.log(responseString);
    });

    //res.on('end', function() {
      //console.log(responseString);
      //var responseObject = JSON.parse(responseString);
      //success(responseObject);
    //});
  });

req.end();