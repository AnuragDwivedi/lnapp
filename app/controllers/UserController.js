var User = require('../models/UserModel');
var GeneralOrder = require('../models/GeneralOrderModel');
var fs = require('fs');
var uuid = require('node-uuid');
var Q = require("q");
var SequenceController = new require('./DbSequenceController');
var DbSequenceController = new SequenceController();

var UserController = function () {};

/**
 * Lists all users.
 *
 *
 * TODO: Refactor to only display online users.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.fetchUsers = function (req, res, next) {
	console.log("Inside fetch users");
	if (req.user) {
		User.find(function (err, users) {
			if (err) {
				return next(err);
			} else {
				return res.json(users);
			}
		});
	} else {
		console.log("401");
		res.send(401);
	}
};


/**
 * Fetch a single user by id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.fetchUser = function (req, res, next) {
	console.log("Inside fetch user");
	console.log(req.params);
	if (req.user) {
		User.findById(req.params.user_id, function (err, user) {
			if (err) {
				return next(err);
			} else {
				res.json(user);
			}
		});
	} else {
		res.send(401);
	}
};


UserController.prototype.createUser = function (req, res, next) {
	console.log("Inside create user\n");
	req.body.address = {
		city: 'Hyderabad',
		state: 'Telanagana',
		country: 'India',
		locality: req.body.locality,
		address: req.body.fullAddress
	};
	var user = new User(req.body);
	console.log("User: " + user);
	if (!user.mobile) {
		console.log('Not a valid mobile number.');
		res.send('Not a valid mobile number.', 400);
	} else {
		var id = uuid.v4();
		user.lastUpdated = user.created = new Date();
		if (req.body.avatar) {
			user.avatar.image = '/img/user/avatar/user-avatar-' + user.username + '-' + id + '.jpg';
		}

		if (req.user && req.user.email) {
			console.log("User1");
			user.createdBy = req.user.email;
			user.updatedBy = req.user.email;
		} else if (user.email) {
			console.log("User1");
			user.createdBy = user.email;
			user.updatedBy = user.email;
		}

		User.findOne({
			mobile: user.mobile
		}, function (err, results) {
			if (err) return next(err);
			if (results) {
				res.send('A user with given mobile number already exists.', 409);
			} else {
				console.log("Saving user");
				DbSequenceController
					.next('user')
					.then(function (result) {
						console.log("New ID : " + result);
						if (!result.next) {
							result.next = null;
						}
						user.userId = result.next;
						user.save(function (err, results) {
							if (err) {
								console.log(err);
								return next(err);
							}

							if (req.body.avatar) {
								var buffer = new Buffer(req.body.avatar.image.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
								fs.writeFile('./img/user/avatar/user-avatar-' + user.username + '-' + id + '.jpg', buffer, 'base64', function (err) {
									if (err) {
										return next(err);
									} else {
										return res.json(user);
									}
								});
							} else {
								return res.json(user);
							}
						});
					});
			}
		});
	}
};


/**
 * Updates a user by id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.updateUser = function (req, res, next) {
	if (req.user) {
		console.log(req.params.userId);
		User.findById(req.params.userId, function (err, user) {

			if (err) {
				return next(err);
			}

			if (req.body.firstName) {
				user.firstName = req.body.firstName; // update the users first name
			}
			if (req.body.lastName) {
				user.lastName = req.body.lastName; // update the users first name
			}
			//			if (req.body.username) {
			//				User.findById(req.body.username, function (err, user) {
			//					if (err) {
			//						return next(err);
			//					} else {
			//						user.username = req.body.username;
			//					}
			//				});
			//			}
			if (req.body.gender) {
				user.gender = req.body.gender;
			}
			if (req.body.email || req.body.email === '') {
				//				User.findById(req.body.email, function (err, user) {
				//					if (err) {
				//						return next(err);
				//					} else {
				//						user.email = req.body.email;
				//					}
				//				});
				user.email = req.body.email;
			}

			user.lastUpdated = new Date();
			if (req.user) {
				user.updatedBy = req.user.email;
			} else {
				user.updatedBy = user.email;
			}

			// save the user
			user.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.send(user);
				}
			});

		});

	} else {
		res.send(401);
	}
};


/**
 * Updates a user's password by id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.updateUserPassword = function (req, res) {
	if (req.user) {

		User.findById(req.params._id, function (err, user) {

			if (err) {
				return next(err);
			} else {

			}

		});
	} else {
		res.send(401);
	}
};


/**
 * Updates a user's avatar by id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.updateUserAvatar = function (req, res, next) {

	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
			response = {};

		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	}

	if (req.user) {

		User.findById(req.user._id, function (err, user) {

			if (err) {
				return next(err);
			}
			var id = uuid.v4();
			var buffer = decodeBase64Image(res.body.image);

			user.avatar.image = '/img/user/avatar/user-avatar-' + user.username + '-' + id + '.jpg';
			user.lastUpdated = new Date();

			// save the user
			user.save(function (err) {
				if (err) {
					return next(err);
				}

				fs.writeFile('./img/user/avatar/user-avatar-' + user.username + '-' + id + '.jpg', buffer, 'base64', function (err) {
					if (err) {
						console.log("err", err);
					}
				});

				res.json(user);

			});

		});
	} else {
		//res.send(401);
	}
};


/**
 * Deletes a user by id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.deleteUser = function (req, res, next) {
	//if(req.passport.user === req.params.user_id){
	User.remove({
		_id: req.params.user_id
	}, function (err, user) {
		if (err) {
			return next(err);
		}
		res.send(200);
	});
	//}
};


/**
 * Finds a user by username.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.findUserByUsername = function (req, res, next) {
	if (req.user) {
		User.findOne({
			username: new RegExp('^' + req.params.username + '$', "i")
		}, function (err, user) {
			if (err) {
				return next(err);
			} else {
				res.json(user);
			}
		});
	} else {
		res.send(401);
	}
};

/**
 * Finds a user by phone.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.findUserByMobile = function (req, res, next) {
	console.log("Searching user by mobile: " + req.params.mobile);
	if (req.user) {
		User.findOne({
			mobile: req.params.mobile
		}, function (err, user) {
			if (err) {
				console.log(err);
				return next(err);
			} else {
				res.json(user);
			}
		});
	} else {
		res.send(401);
	}
};


/**
 * Finds a user by wildcard on name, phone or id.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.findUserBySearch = function (req, res, next) {
	if (req.user) {
		var searchArr = [],
			searchText = req.params.searchText;
		if (isNaN(searchText)) {
			searchArr = [{
				firstName: new RegExp(searchText, "i")
			}, {
				lastName: new RegExp(searchText, "i")
			}];
		} else {
			searchArr = [{
				userId: searchText
			}, {
				mobile: searchText
			}];
		}
		User.find({
			$and: [{
					$or: searchArr
				}, {
					'userId': {
						$exists: true,
						$ne: null
					}
				}, {
					'role': {
						$ne: 'Admin'
					}
				}
			]
		}, function (err, user) {
			if (err) {
				console.log(err);
				return next(err);
			} else {
				res.json(user);
			}
		});
	} else {
		res.send(401);
	}
};


/**
 * Gets all the orders for a user.
 *
 * @param {Object} req the request.
 * @param {Object} res the response.
 */
UserController.prototype.getAllOrders = function (req, res, next) {
	if (req.user) {
		GeneralOrder.find({
			"user": req.params.userId
		}, function (err, orders) {
			if (err) {
				return next(err);
			}
			res.json(orders);
		});

	} else {
		res.send(401);
	}
};

// Methods for internal use
UserController.prototype.createUserFromOrder = function (userObj) {
	var deferred = Q.defer();
	var user = new User(userObj);
	var isResolved = false;
	User.findOne({
			mobile: user.mobile
		})
		.exec()
		.then(function (user) {
			if (user) {
				console.log('User with mobile found');
				isResolved = true;
				deferred.resolve(user);
			} else {
				return DbSequenceController.next('user');
			}
		})
		.then(function (result) {
			if (!isResolved) {
				console.log("New ID : " + result);
				if (!result.next) {
					result.next = null;
				}
				user.userId = result.next;
				console.log("Res: " + user);
				return user.save();
			} else {
				console.log("Return 1");
				return;
			}
		})
		.then(function (user) {
			if (!isResolved) {
				console.log("Res2: " + user);
				deferred.resolve(user);
			} else {
				console.log("Return 2");
				return;
			}
		})
		.catch(function (error) {
			console.log("Err-User-Cont: " + error);
			deferred.resolve(null);
		});

	return deferred.promise;
};

module.exports = UserController;
