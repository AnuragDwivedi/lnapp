"use strict";
var laundryNerds = angular.module('laundrynerdsAdminApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngStorage', 'laundrynerdsCommonsApp', 'laundrynerdsAdminControllers']);
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
					return webservice.fetchSubscriptions(null);
				}]
			},
			name: 'subscription.manage',
			url: '/manage',
			templateUrl: '../admin/views/subscription/manage.html',
			controller: 'SubscriptionManageCtrl'
		};
		var subscriptionEnrollChildState = {
			resolve: {
				subscriptionList: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchSubscriptions(true);
				}]
			},
			name: 'subscription.enroll',
			url: '/enroll',
			templateUrl: '../admin/views/subscription/enroll.html',
			controller: 'SubscriptionEnrollCtrl'
		};
		var subscriptionEnrollmentsChildState = {
			resolve: {
				enrollments: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchEnrollments(true);
				}]
			},
			name: 'subscription.enrollments',
			url: '/enrollments',
			templateUrl: '../admin/views/subscription/enrollments.html',
			controller: 'SubscriptionEnrollmentsCtrl'
		};
		var subscriptionOrdersChildState = {
			resolve: {
				ordersList: ['webservice', function (webservice) {
					return webservice.fetchSubscriptionOrders();
				}]
			},
			name: 'subscription.order',
			url: '/order',
			templateUrl: '../admin/views/subscription/order.html',
			controller: 'SubscriptionOrderListCtrl'
		};
		var subscriptionOrderDetailGrandChildState = {
			resolve: {
				ordersDetails: ['webservice', '$stateParams', function (webservice, $stateParams) {
					return webservice.fetchSubscriptionOrderById($stateParams.orderId);
				}]
			},
			name: 'subscription.order.detail',
			url: '/:orderId',
			templateUrl: '../admin/views/subscription/orderDetails.html',
			controller: 'SubscriptionOrderDetailsCtrl'
		};

		$stateProvider.state(subscriptionParentState);
		$stateProvider.state(subscriptionManageChildState);
		$stateProvider.state(subscriptionEnrollChildState);
		$stateProvider.state(subscriptionEnrollmentsChildState);
		$stateProvider.state(subscriptionOrdersChildState);
		$stateProvider.state(subscriptionOrderDetailGrandChildState);

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

		var commercialParentState = {
			name: 'commercial',
			url: '/commercial',
			template: '<ui-view/>',
			abstract: true
		};
		var commercialCreateChildState = {
			name: 'commercial.create',
			url: '/create',
			templateUrl: '../admin/views/commercial/create.html',
			controller: 'CommercialCreateCtrl'
		};
		var commercialLeadsChildState = {
			resolve: {
				leads: ['webservice', function (webservice) {
					return webservice.fetchLeads(true);
				}]
			},
			name: 'commercial.leads',
			url: '/leads',
			templateUrl: '../admin/views/commercial/leads.html',
			controller: 'CommercialLeadsCtrl'
		};
		$stateProvider.state(commercialParentState);
		$stateProvider.state(commercialCreateChildState);
		$stateProvider.state(commercialLeadsChildState);

		var lookupsParentState = {
			name: 'lookups',
			url: '/lookups',
			template: '<ui-view/>',
			abstract: true
		};
		var pricelistChildState = {
			name: 'lookups.pricelist',
			url: '/pricelist',
			templateUrl: '../admin/views/lookup/pricelist.html',
			controller: 'PricelistCtrl'
		};
		$stateProvider.state(lookupsParentState);
		$stateProvider.state(pricelistChildState);
	});
