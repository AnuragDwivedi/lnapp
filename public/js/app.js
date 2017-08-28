"use strict";
var laundryNerds = angular.module('laundrynerdsApp', ['ui.bootstrap', 'ui.router', 'ngCookies', 'laundryNerdsControllers']);

laundryNerds
	.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
		// It's very handy to add references to $state and $stateParams to the $rootScope
		// so that you can access them from any scope within your applications.
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
    }])
	.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				name: 'home',
				url: '/',
				template: '<div>Hello</div>'
			})
    }])
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
				return $http.post(baseUrl + url, JSON.stringify(postData));
			}
		};

		this.put = function (url, postData) {
			if (!!url && !!postData) {
				return $http.put(baseUrl + url, JSON.stringify(postData));
			}
		};
    }]);
