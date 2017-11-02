"use strict";
var laundryNerds = angular.module('laundrynerdsAdminApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'laundrynerdsAdminControllers']);

laundryNerds
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/order/create');
		var orderParentState = {
			name: 'order',
			url: '/order',
			template: '<ui-view/>',
			abstract: true
		};

		var createChildState = {
			name: 'order.create',
			url: '/create',
			templateUrl: '../admin/views/orderCreate.html',
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
			templateUrl: '../admin/views/orderlist.html',
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
			templateUrl: '../admin/views/orderlist.html',
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
			templateUrl: '../admin/views/orderlist.html',
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
			templateUrl: '../admin/views/orderDetails.html',
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
			templateUrl: '../admin/views/orderDetails.html',
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
			templateUrl: '../admin/views/orderDetails.html',
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

		var customerParentState = {
			name: 'customer',
			url: '/customer',
			template: '<ui-view/>',
			abstract: true
		};

		var customerDetailChildState = {
			name: 'customer.detail',
			url: '/detail',
			templateUrl: '../admin/views/customerDetails.html',
			controller: 'CustomerDetailsCtrl'
		};

		var customerCreateChildState = {
			name: 'customer.create',
			url: '/create',
			templateUrl: '../admin/views/customerCreate.html',
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
	.service('webservice', ['config', '$http', function (config, $http) {
		var baseUrl = ((window.location.pathname.indexOf("blog") === -1 && window.location.pathname.indexOf("admin") == -1) ? config.host : config.nonAppHost) + config.context;
		this.get = function (url) {
			if (!!url) {
				return $http.get(baseUrl + url);
			} else {
				return "No url passed";
			}
		};

		this.post = function (url, postData) {
			if (!!url && !!postData) {
				return $http.post(baseUrl + url, angular.toJson(postData));
			}
		};

		this.put = function (url, postData) {
			if (!!url && !!postData) {
				return $http.put(baseUrl + url, angular.toJson(postData));
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
    }]);
