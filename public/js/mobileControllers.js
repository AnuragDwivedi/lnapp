var laundrynerdsMobileControllers = angular.module('laundrynerdsMobileControllers', ['ngCookies', 'laundrynerdsDirectives']);


// Admin controllers
laundrynerdsMobileControllers.controller('LoginCtrl', ['$scope', 'webservice', 'util', '$sessionStorage', function ($scope, webservice, util, $sessionStorage) {
	$scope.username = null;
	$scope.password = null;
	$scope.loginStatus = "";

	$scope.submit = function () {
		var loginObj = {
			username: $scope.username,
			password: $scope.password
		};
		var urlHash = window.location.hash;

		webservice.post('login', loginObj).then(function (response) {
			$sessionStorage["currentUser"] = response.data;
			if (util.hasMobileRole()) {
				window.location = window.location.origin + "/mobile/" + urlHash;
			} else {
				$scope.loginStatus = "Not sufficient previlages";
			}
		}, function (error) {
			$scope.loginStatus = "Username or Password is incorrect!";
		});
	};
}]);

laundrynerdsMobileControllers.controller('OrdersCtrl', ['$scope', '$sessionStorage', 'webservice', 'orders', function ($scope, $sessionStorage, webservice, orders) {
	$scope.orderType = "Online";
	$scope.errorMessage = "";
	$scope.searchText = "";

	$scope.optionChangeHandler = function(value) {
		loadOrders();
	};

	var loadOrders = function () {
		$scope.orders = [];
		$scope.errorMessage = "";
		webservice.fetchOrders($scope.orderType === 'Retail' ? 'Retail' : 'Online', $scope.orderType === 'Online' ? false : true).then(function (orders) {
			if (orders.data && orders.data.length) {
				$scope.orders = orders.data;
				//$scope.$apply();
			} else{
				$scope.orders = [];
				//$scope.$apply();
			}
		}, function (error) {
			$scope.errorMessage = "Error loading leads.";
		});
	};

	if (orders.status === 200 && orders.data && orders.data.length > 0) {
		$scope.orders = orders.data;
	} else if (leads.status === 401 && leads.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.orders = [];
	}
}]);