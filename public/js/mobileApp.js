"use strict";
var laundryNerds = angular.module('laundrynerdsMobileApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngStorage', 'laundrynerdsCommonsApp', 'laundrynerdsMobileControllers']);

laundryNerds
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/orders');

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
});