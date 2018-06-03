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
			$sessionStorage.currentUser = response.data;
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

laundrynerdsMobileControllers.controller('OrdersCtrl', ['$scope', '$sessionStorage', 'webservice', 'orders', 'pdUsers', function ($scope, $sessionStorage, webservice, orders, pdUsers) {
	var resetMessageWithDelay = function (order, delay) {
		window.setTimeout(function () {
			order.savedSuccess = null;
		}, !!delay ? !!delay : 50000);
	};

	$scope.orderType = "Online";
	$scope.errorMessage = "";
	$scope.searchText = "";
	$scope.pdUsers = pdUsers.data;
	$scope.optionChangeHandler = function (value) {
		loadOrders();
	};
	$scope.assignedToHandler = function (order) {
		if(order.assignedTo) {
			webservice.put('generalorder/' + order._id, {"assignedTo" : order.assignedTo}).then(function (response) {
				order.savedSuccess = true;
				resetMessageWithDelay(order);
			}, function (error) {
				order.savedSuccess = false;
				resetMessageWithDelay(order);
			});
		}
	};
	var loadOrders = function () {
		$scope.orders = [];
		$scope.errorMessage = "";
		webservice.fetchOrders($scope.orderType === 'Retail' ? 'Retail' : 'Online', $scope.orderType === 'Online' ? false : true).then(function (orders) {
			if (orders.data && orders.data.length) {
				$scope.orders = orders.data;
				//$scope.$apply();
			} else {
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