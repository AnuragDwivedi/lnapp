"use strict";
var laundryNerds = angular.module('laundrynerdsMobileApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngStorage', 'laundrynerdsCommonsApp', 'laundrynerdsMobileControllers']);

laundryNerds
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('orders');

    var ordersState = {
        resolve: {
            orders: ['webservice', function (webservice) {
                return webservice.fetchOrders('Online', false);
            }],
            pdUsers: ['webservice', function (webservice) {
                return webservice.fetchUsersByRole('PD');
            }]
        },
        name: 'orders',
        url: '/orders',
        templateUrl: '../mobile/views/orders.html?v1.2',
        controller: 'OrdersCtrl'
    };
    $stateProvider.state(ordersState);

    var orderParentState = {
        name: 'order',
        url: '/order',
        template: '<ui-view/>',
        abstract: true
    };
    var orderDetailsState = {
        resolve: {
            ordersDetails: ['webservice', '$stateParams', function (webservice, $stateParams) {
                return webservice.fetchOrderDetails($stateParams.orderId);
            }],
            pdUsers: ['webservice', function (webservice) {
                return webservice.fetchUsersByRole('PD');
            }]
        },
        name: 'order.details',
        url: '/:orderId',
        templateUrl: '../mobile/views/orderDetails.html',
        controller: 'OrderDetailsCtrl'
    };
    $stateProvider.state(orderParentState);
    $stateProvider.state(orderDetailsState);
});