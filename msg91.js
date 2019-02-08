const http = require('http');

http.get('http://api.msg91.com/api/sendhttp.php?message=Test from Socket&country=91&authkey=&mobiles=9949109864&route=4&sender=LNerds', (resp) => {
	let data = '';

	// A chunk of data has been recieved.
	resp.on('data', (chunk) => {
		data += chunk;
	});

	// The whole response has been received. Print out the result.
	resp.on('end', () => {
		console.log(data);
	});

}).on("error", (err) => {
	console.log("Error: " + err.message);
});
