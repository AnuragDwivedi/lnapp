"use strict";
var laundryNerds = angular.module('laundrynerdsCommonsApp', ['ui.bootstrap', 'ngCookies', 'ngStorage']);
laundryNerds
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
			paymentModes: ["Card", "Cash", "PayTM"],
			paymentStatuses: ["Not Paid", "Paid"],
			propertyType: ["Hotel", "Restaurant", "Spa", "Convention Center"],
			propertySize: ["Small", "Medium", "Large"],
			engagementPhase: ["In Discussion", "On Hold", "Queried", "Live", "Cancelled"],
			areasCovered: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur"],
			commercialAreasCovered: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur", "Jubilee Hills"],
			commercialPropertyTypes: ["Hotel", "Spa", "Restaurant"],
			commercialPropertySizes: ["Small", "Medium", "Large"],
			engagementPhases: ["Initiated", "Sampling", "In Discussion", "Live", "Cancelled"],
			salutations: ["Mr.", "Ms.", "Mrs"]
		};
	})
	.factory('util', ['$sessionStorage', function ($sessionStorage) {
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
				if ((url.indexOf("generalorder") === -1 && url.indexOf("subscriptionorder") === -1) && $sessionStorage[url]) {
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
	}]);