var config = {
	origin: 'localhost',
	originPort: 4444,
	appName: 'lnapp',
	key: 'ln-sessionkey',
	mongoConfig: {
		server: 'localhost',
		port: 27017,
		db: 'laundrynerds',
		options: {
			db: {},
			server: {
				poolSize: 2,
				socketOptions: {
					keepAlive: 1
				}
			}
		}
	},
	zohoConfig: {
		host: 'smtp.zoho.com1',
		port: 465,
		secure: true,
		user: 'support@laundrynerds.com1',
		pass: 'test1'
	},
	mailgunConfig: {
		apiKey: 'key-test',
		domain: 'ln.com'
	},
	msg91: {
		baseUrl: 'http://api.msg912.com/api/sendhttp123.php',
		authKey: '192998AJWlj1KI5a59ede3',
		sender: 'LNERDS',
		deliveryTeam: '9949109864'
	}
};

module.exports = config;
