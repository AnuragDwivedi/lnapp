"use strict";
var laundryNerds = angular.module('laundrynerdsCommonsApp', ['ui.bootstrap', 'ngCookies', 'ngStorage']);
laundryNerds
	.filter('range', function () {
		return function (input, total) {
			total = parseInt(total);
			for (var i = 0; i < total; i++)
				input.push(i);
			return input;
		};
	})
	.factory('config', function () {
		return {
			host: "",
			nonAppHost: "../",
			context: "api/"
		};
	})
	.factory('lookup', function () {
		return {
			washTypes: ["Wash & Iron", "Wash & Fold", "Dry Cleaning", "Dyeing", "Darning", "Rolling"],
			orderStatuses: ["Received", "Picked up", "Tagged", "Washed", "Ironed", "Ready", "Delivered", "Delayed", "Duplicate", "Cancelled"],
			orderStatusesForPD: ["Received", "Ready"],
			orderUpdateStatusesForPD: ["Picked up", "Delivered"],
			paymentModes: ["Card", "Cash", "PayTM"],
			paymentStatuses: ["Not Paid", "Paid"],
			propertyType: ["Hotel", "Restaurant", "Spa", "Convention Center"],
			propertySize: ["Small", "Medium", "Large"],
			engagementPhase: ["In Discussion", "On Hold", "Queried", "Live", "Cancelled"],
			areasCovered: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur"],
			commercialAreasCovered: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur", "Jubilee Hills"],
			commercialPropertyTypes: ["Hotel", "Spa", "Restaurant", "Service Apartments"],
			commercialPropertySizes: ["Small", "Medium", "Large"],
			engagementPhases: ["Initiated", "Sampling", "In Discussion", "Live", "Cancelled"],
			salutations: ["Mr.", "Ms.", "Mrs"]
		};
	})
	.factory('util', ['$sessionStorage', 'lookup', function ($sessionStorage, lookup) {
		return {
			getUrlParameter: function (param, dummyPath) {
				var sPageURL = dummyPath || window.location.href.substring(0),
					sURLVariables = sPageURL.split(/[&||?]/),
					res;

				for (var i = 0; i < sURLVariables.length; i += 1) {
					var paramName = sURLVariables[i],
						sParameterName = (paramName || '').split('=');

					if (sParameterName[0] === param) {
						res = sParameterName[1];
					}
				}

				return res;
			},

			hasMobileRole: function () {
				var currentUser = $sessionStorage.currentUser;
				if (currentUser && (currentUser.role === "PD" || currentUser.role === "Manager")) {
					return true;
				}
				return false;
			},

			hasAdminRole: function () {
				var currentUser = $sessionStorage.currentUser;
				if (currentUser && currentUser.role === "Admin") {
					return true;
				}
				return false;
			},

			parseJsonDate: function (dateString) {
				if (dateString) {
					return new Date(dateString);
				}
				return new Date();
			},

			getAllowedOrderStatuses: function (currentStatus) {
				var statuses = [];
				if (!currentStatus) {
					statuses = lookup.orderStatuses;
				} else {
					for (var i = 0; i < lookup.orderStatuses.length; i++) {
						if (statuses.length) {
							statuses.push(lookup.orderStatuses[i]);
							continue;
						}
						if (lookup.orderStatuses[i] === currentStatus) {
							statuses.push(lookup.orderStatuses[i]);
						}
					}
				}

				return statuses;
			},

			getAllowedEngagementPhases: function (currentPhase) {
				var phases = [];
				for (var i = 0; i < lookup.engagementPhases.length; i++) {
					if (phases.length) {
						phases.push(lookup.engagementPhases[i]);
						continue;
					}
					if (lookup.engagementPhases[i] === currentPhase) {
						phases.push(lookup.engagementPhases[i]);
					}
				}

				return phases;
			},

			resetButtonWithDelay: function (btnId, delay) {
				window.setTimeout(function () {
					$(btnId).button('reset');
				}, !!delay ? !!delay : 5000);
			},

			refreshSelectPicker: function (className) {
				setTimeout(function () {
					$(className).selectpicker();
				}, 1);
			},

			getFirstLetterMap: function(str) {
				return str.charAt(0).toUpperCase();
			}
		};
	}])
	.service('webservice', ['config', '$http', '$sessionStorage', function (config, $http, $sessionStorage) {
		var baseUrl = ((window.location.pathname.indexOf("blog") === -1 &&
			window.location.pathname.indexOf("admin") == -1 &&
			window.location.pathname.indexOf("mobile") == -1) ? config.host : config.nonAppHost) + config.context;
		this.get = function (url) {
			if (!!url) {
				var promise;
				if ((url.indexOf("generalorder") === -1 && url.indexOf("subscriptionorder") === -1 && url.indexOf("commercial/order") === -1) && $sessionStorage[url]) {
					promise = new Promise(function (resolve, reject) {
						resolve(JSON.parse($sessionStorage[url]));
					});
				} else {
					promise = $http.get(baseUrl + url);

					// Handle signout error
					promise.then(function (response) {
						if (window.location.pathname.indexOf("login.html") === -1 && response.status === 401) {
							window.location = window.location.origin + "/admin/login.html";
						} else {
							$sessionStorage[url] = JSON.stringify(response);
						}
					}).catch(function (err) {
						if (window.location.pathname.indexOf("login.html") === -1 && err.status === 401) {
							window.location = window.location.origin + "/admin/login.html";
						}
					});
				}

				return promise;
			} else {
				return "No url passed";
			}
		};

		this.post = function (url, postData) {
			if (!!url && !!postData) {
				var promise;
				promise = $http.post(baseUrl + url, angular.toJson(postData));

				// Handle signout error
				promise.then(function (response) {
					if (window.location.pathname.indexOf("login.html") === -1 && response.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				}).catch(function (err) {
					if (window.location.pathname.indexOf("login.html") === -1 && err.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				});

				return promise;
			}
		};

		this.put = function (url, postData) {
			if (!!url && !!postData) {
				var promise;
				promise = $http.put(baseUrl + url, angular.toJson(postData));

				// Handle signout error
				promise.then(function (response) {
					if (window.location.pathname.indexOf("login.html") === -1 && response.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				}).catch(function (err) {
					if (window.location.pathname.indexOf("login.html") === -1 && err.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				});

				return promise;
			}
		};

		this.delete = function (url) {
			if (!!url) {
				var promise;
				promise = $http.delete(baseUrl + url);

				// Handle signout error
				promise.then(function (response) {
					if (window.location.pathname.indexOf("login.html") === -1 && response.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				}).catch(function (err) {
					if (window.location.pathname.indexOf("login.html") === -1 && err.status === 401) {
						window.location = window.location.origin + "/admin/login.html";
					}
				});

				return promise;
			}
		};

		this.fetchOrders = function (orderSource, isAdmin) {
			if (orderSource) {
				return this.get('generalorder?source=' + orderSource + '&isAdmin=' + (isAdmin ? true : false));
			}
		};

		this.fetchOrderDetails = function (orderId) {
			if (orderId) {
				return this.get('generalorder/' + orderId);
			}
		};

		this.fetchSubscriptions = function (isEnabled) {
			var url = 'subscription';
			if (isEnabled === true)
				url += "?isEnabled=true";
			else if (isEnabled === false)
				url += "?isEnabled=false";
			return this.get(url);
		};

		this.fetchEnrollments = function (isActive) {
			var url = 'subscriptionenroll';
			if (isActive === true)
				url += "?isActive=true";
			else if (isActive === false)
				url += "?isActive=false";
			return this.get(url);
		};

		this.fetchSubscriptionOrders = function () {
			return this.get('subscriptionorder');
		};

		this.fetchSubscriptionOrderById = function (orderId) {
			return this.get('subscriptionorder/' + orderId);
		};

		this.fetchLeads = function (isEnabled) {
			var url = 'commercial/lead';
			if (isEnabled === true)
				url += "?isEnabled=true";
			else if (isEnabled === false)
				url += "?isEnabled=false";
			return this.get(url);
		};

		this.fetchUsersByRole = function (role) {
			var url = 'user/role/' + role;
			return this.get(url);
		};

		this.fetchOrdersByStatus = function (status) {
			return this.get('generalorder/status?status=' + (status ? status : ''));
		};

		this.fetchCommercialOrders = function () {
			return this.get('commercial/order');
		};
	}]);