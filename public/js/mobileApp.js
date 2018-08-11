"use strict";
var laundryNerds = angular.module('laundrynerdsMobileApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'ngStorage', 'laundrynerdsCommonsApp', 'laundrynerdsMobileControllers']);

laundryNerds
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('orders');

    var ordersState = {
        resolve: {
            pdUsers: ['$sessionStorage', 'webservice', function ($sessionStorage, webservice) {
                if($sessionStorage.currentUser && $sessionStorage.currentUser.role && $sessionStorage.currentUser.role != "PD") {
                    return webservice.fetchUsersByRole('PD');
                } else {
                    return [];
                }
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
            pdUsers: ['$sessionStorage', 'webservice', function ($sessionStorage, webservice) {
                if($sessionStorage.currentUser && $sessionStorage.currentUser.role && $sessionStorage.currentUser.role != "PD") {
                    return webservice.fetchUsersByRole('PD');
                } else {
                    return [];
                }
            }],
            previousState: ["$state", function ($state) {
                var currentStateData = {
                    name: $state.current.name,
                    params: $state.params,
                    url: $state.href($state.current.name, $state.params)
                };
                return currentStateData;
            }]
        },
        name: 'order.details',
        url: '/:orderId',
        templateUrl: '../mobile/views/orderDetails.html',
        controller: 'OrderDetailsCtrl'
    };
    $stateProvider.state(orderParentState);
    $stateProvider.state(orderDetailsState);

    var pricelistState = {
        resolve: {
            pdUsers: ['$sessionStorage', 'webservice', function ($sessionStorage, webservice) {
                if($sessionStorage.currentUser && $sessionStorage.currentUser.role && $sessionStorage.currentUser.role != "PD") {
                    return webservice.fetchUsersByRole('PD');
                } else {
                    return [];
                }
            }]
        },
        name: 'pricelist',
        url: '/pricelist',
        templateUrl: '../mobile/views/pricelist.html',
        controller: 'PricelistCtrl'
    };
    $stateProvider.state(pricelistState);
});