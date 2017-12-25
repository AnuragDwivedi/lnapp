"use strict";
var laundryNerds = angular.module('laundrynerdsAdminApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'laundrynerdsAdminControllers']);
laundryNerds
	.config(function ($stateProvider, $urlRouterProvider) {
		if (window.location.href.indexOf("invoice.html") < 0) {
			$urlRouterProvider.otherwise('/order/create');
		}
		var orderParentState = {
			name: 'order',
			url: '/order',
			template: '<ui-view/>',
			abstract: true
		};

		var createChildState = {
			name: 'order.create',
			url: '/create',
			templateUrl: '../admin/views/order/orderCreate.html',
			controller: 'CreateOrderCtrl'
		};

		var retailChildState = {
			resolve: {
				ordersList: ['webservice', function (webservice) {
					return webservice.fetchOrders('Retail', true);
				}]
			},
			name: 'order.retail',
			url: '/retail',
			templateUrl: '../admin/views/order/orderlist.html',
			controller: 'OrderListCtrl'
		};

		var onlineretailChildState = {
			resolve: {
				ordersList: ['webservice', function (webservice) {
					return webservice.fetchOrders('Online', true);
				}]
			},
			name: 'order.onlineRetail',
			url: '/onlineretail',
			templateUrl: '../admin/views/order/orderlist.html',
			controller: 'OrderListCtrl'
		};

		var onlineChildState = {
			resolve: {
				ordersList: ['webservice', function (webservice) {
					return webservice.fetchOrders('Online', false);
				}]
			},
			name: 'order.online',
			url: '/online',
			templateUrl: '../admin/views/order/orderlist.html',
			controller: 'OrderListCtrl'
		};

		var retailsOrderDetailGrandChildState = {
			resolve: {
				ordersDetails: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchOrderDetails($stateParams.orderId);
				}]
			},
			name: 'order.retail.detail',
			url: '/:orderId',
			templateUrl: '../admin/views/order/orderDetails.html',
			controller: 'OrderDetailsCtrl'
		};

		var onlineRetailOrderDetailGrandChildState = {
			resolve: {
				ordersDetails: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchOrderDetails($stateParams.orderId);
				}]
			},
			name: 'order.onlineRetail.detail',
			url: '/:orderId',
			templateUrl: '../admin/views/order/orderDetails.html',
			controller: 'OrderDetailsCtrl'
		};

		var onlineOrderDetailGrandChildState = {
			resolve: {
				ordersDetails: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchOrderDetails($stateParams.orderId);
				}]
			},
			name: 'order.online.detail',
			url: '/:orderId',
			templateUrl: '../admin/views/order/orderDetails.html',
			controller: 'OrderDetailsCtrl'
		};

		$stateProvider.state(orderParentState);
		$stateProvider.state(createChildState);
		$stateProvider.state(retailChildState);
		$stateProvider.state(onlineretailChildState);
		$stateProvider.state(onlineChildState);
		$stateProvider.state(retailsOrderDetailGrandChildState);
		$stateProvider.state(onlineRetailOrderDetailGrandChildState);
		$stateProvider.state(onlineOrderDetailGrandChildState);

		var subscriptionParentState = {
			name: 'subscription',
			url: '/subscription',
			template: '<ui-view/>',
			abstract: true
		};

		var subscriptionManageChildState = {
			resolve: {
				subscriptionList: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchSubscriptions();
				}]
			},
			name: 'subscription.manage',
			url: '/manage',
			templateUrl: '../admin/views/subscription/manage.html',
			controller: 'SubscriptionManageCtrl'
		};

		var subscriptionCreateChildState = {
			name: 'subscription.create',
			url: '/create',
			templateUrl: '../admin/views/customer/customerCreate.html',
			controller: 'CustomerCreateCtrl'
		};
		$stateProvider.state(subscriptionParentState);
		$stateProvider.state(subscriptionManageChildState);
		$stateProvider.state(subscriptionCreateChildState);

		var customerParentState = {
			name: 'customer',
			url: '/customer',
			template: '<ui-view/>',
			abstract: true
		};

		var customerDetailChildState = {
			name: 'customer.detail',
			url: '/detail',
			templateUrl: '../admin/views/customer/customerDetails.html',
			controller: 'CustomerDetailsCtrl'
		};

		var customerCreateChildState = {
			name: 'customer.create',
			url: '/create',
			templateUrl: '../admin/views/customer/customerCreate.html',
			controller: 'CustomerCreateCtrl'
		};
		$stateProvider.state(customerParentState);
		$stateProvider.state(customerDetailChildState);
		$stateProvider.state(customerCreateChildState);
	})
	.factory('config', function () {
		return {
			host: "",
			nonAppHost: "../",
			context: "api/"
		};
	})
	.factory('util', function () {
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
			}
		}
	})
	.service('webservice', ['config', '$http', function (config, $http) {
		var baseUrl = ((window.location.pathname.indexOf("blog") === -1 && window.location.pathname.indexOf("admin") == -1) ? config.host : config.nonAppHost) + config.context;
		this.get = function (url) {
			if (!!url) {
				var promise;
				promise = $http.get(baseUrl + url);

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

		this.fetchSubscriptions = function () {
			return this.get('subscription');
		};
	}]);
