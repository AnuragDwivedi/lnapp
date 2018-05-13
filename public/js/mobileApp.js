"use strict";
var laundryNerds = angular.module('laundrynerdsMobileApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngStorage', 'laundrynerdsCommonsApp', 'laundrynerdsMobileControllers']);

laundryNerds
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/order/online');
    var orderParentState = {
        name: 'order',
        url: '/order',
        template: '<ui-view/>',
        abstract: true
    };
    var onlineChildState = {
        resolve: {
            orders: ['webservice', function (webservice) {
                return webservice.fetchOrders('Online', false);
            }]
        },
        name: 'order.online',
        url: '/online',
        templateUrl: '../mobile/views/orders.html?v1.2',
        controller: 'OrdersCtrl'
    };
    
    $stateProvider.state(orderParentState);
    $stateProvider.state(onlineChildState);
});