var laundrynerdsMobileControllers = angular.module('laundrynerdsMobileControllers', ['ngCookies', 'laundrynerdsDirectives']);

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

laundrynerdsMobileControllers.controller('MainCtrl', ['$scope', '$state', '$sessionStorage', function ($scope, $state, $sessionStorage) {
	$scope.currentUser = $sessionStorage.currentUser.firstName + " " + $sessionStorage.currentUser.lastName;
	$scope.role = $sessionStorage.currentUser.role;
	$scope.goHome = function () {
		$state.go('orders');
	};
	$scope.logout = function () {
		console.log("Logging out");
	};
}]);

laundrynerdsMobileControllers.controller('OrdersCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'pdUsers', 'lookup', 'util', function ($scope, $state, $sessionStorage, webservice, pdUsers, lookup, util) {
	var resetMessageWithDelay = function (order, delay) {
		window.setTimeout(function () {
			order.successMessage = "";
			order.errorMessage = "";
			order.savedSuccess = null;
		}, !!delay ? !!delay : 5000);
	};
	$scope.role = $sessionStorage.currentUser.role.toLowerCase();
	$scope.orderStatusesForPD = lookup.orderStatusesForPD;
	$scope.orderStatuses = lookup.orderStatuses;
	$scope.util = util;

	$scope.orderType = "Online";
	$scope.orderStatus = $scope.orderStatusesForPD[0];
	$scope.errorMessage = "";
	$scope.searchText = "";
	$scope.pdUsers = pdUsers.data;
	$scope.optionChangeHandler = function (value) {
		loadOrders();
	};
	$scope.assignedToHandler = function (order) {
		if (order.assignedTo) {
			webservice.put('generalorder/' + order._id, {
				"assignedTo": order.assignedTo
			}).then(function (response) {
				order.successMessage = "Order assigned successfully";
				order.savedSuccess = true;
			}, function (error) {
				order.errorMessage = "Error assigning order";
				order.savedSuccess = false;
			}).finally(function () {
				resetMessageWithDelay(order);
			});
		}
	};
	$scope.statusChangeHandler = function (order) {
		var orderObj = {
			orderStatus: order.orderStatus
		};
		webservice.put('generalorder/' + order._id, orderObj).then(function (response) {
			order.successMessage = "Order status updated successfully";
			order.savedSuccess = true;
		}, function (error) {
			order.errorMessage = "Error updating order status!";
			order.savedSuccess = false;
		}).finally(function () {
			resetMessageWithDelay(order);
		});
	};
	$scope.openOrderDetails = function (orderId) {
		$state.go('order.details', {
			"orderId": orderId
		});
	};
	$scope.udpatePdDates = function (operation, order) {
		var reqObj = {};
		if (operation === "pickup") {
			reqObj.actualPickupDate = new Date();
			reqObj.deliveryDate = order.deliveryDate;
			reqObj.status = lookup.orderUpdateStatusesForPD[0];
		} else if (operation === "delivery") {
			reqObj.actualDeliveryDate = new Date();
			reqObj.status = lookup.orderUpdateStatusesForPD[1];
		}

		webservice.put('generalorder/' + order._id, reqObj).then(function (response) {
			order.successMessage = "Order updated successfully";
			order.savedSuccess = true;
		}, function (error) {
			order.errorMessage = "Error updating order!";
			order.savedSuccess = false;
		}).finally(function () {
			resetMessageWithDelay(order);
		});
	};

	var loadOrders = function () {
		$scope.orders = [];
		$scope.errorMessage = "";
		var getOrdersByRole = ($scope.role === 'pd') ?
			webservice.fetchOrdersByStatus($scope.orderStatus) :
			webservice.fetchOrders($scope.orderType === 'Retail' ? 'Retail' : 'Online', $scope.orderType === 'Online' ? false : true);

		getOrdersByRole.then(function (orders) {
			if (orders.status === 200 && orders.data && orders.data.length > 0) {
				for (var i = 0; i < orders.data.length; i++) {
					orders.data[i].deliveryDate = util.parseJsonDate(orders.data[i].deliveryDate);
				}
				$scope.orders = orders.data;
				//$scope.$apply();
			} else if (orders.status === 401 && orders.statusText === "Unauthorized") {
				window.location = "login.html";
			} else {
				$scope.errorMessage = "No Orders available.";
				$scope.orders = [];
				//$scope.$apply();
			}
		}, function (error) {
			$scope.errorMessage = "Error loading leads.";
		});
	};
	loadOrders();
}]);

laundrynerdsMobileControllers.controller('OrderDetailsCtrl', ['$rootScope', '$scope', '$state', '$sessionStorage', 'webservice', 'lookup', 'util', 'ordersDetails', 'pdUsers', 'previousState', function ($rootScope, $scope, $state, $sessionStorage, webservice, lookup, util, ordersDetails, pdUsers, previousState) {
	var resetMessageWithDelay = function (order, delay) {
		window.setTimeout(function () {
			order.savedSuccess = null;
			order.successMessage = "";
			order.errorMessage = "";
			$scope.$apply();
		}, !!delay ? !!delay : 5000);
	};
	$scope.role = $sessionStorage.currentUser.role.toLowerCase();
	$scope.orderStatuses = [];

	$scope.pdUsers = pdUsers.data;
	$scope.assignedToHandler = function (order) {
		if (order.assignedTo) {
			webservice.put('generalorder/' + order._id, {
				"assignedTo": order.assignedTo
			}).then(function (response) {
				order.successMessage = "Order assigned successfully";
				order.savedSuccess = true;
			}, function (error) {
				order.errorMessage = "Error assigning order";
				order.savedSuccess = false;
			}).finally(function () {
				resetMessageWithDelay(order);
			});
		}
	};
	$scope.statusChangeHandler = function (order) {
		var orderObj = {
			orderStatus: order.orderStatus
		};
		webservice.put('generalorder/' + order._id, orderObj).then(function (response) {
			order.successMessage = "Order status updated successfully";
			order.savedSuccess = true;
		}, function (error) {
			order.errorMessage = "Error updating order status!";
			order.savedSuccess = false;
		}).finally(function () {
			resetMessageWithDelay(order);
		});
	};

	$scope.navigateToPreviousState = function () {
		if (previousState.name) {
			$state.go(previousState.name, previousState.params);
		} else {
			$state.go('orders');
		}
	};

	if (ordersDetails.status === 200 && ordersDetails.data) {
		$scope.order = ordersDetails.data;
		$scope.order.items = $scope.order.items ? $scope.order.items : [];
		$scope.message = "";
	} else if (ordersDetails.status === 401 && ordersDetails.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.message = "No details found";
	}

	// Allow only status change forwards
	$scope.orderStatuses = util.getAllowedOrderStatuses($scope.order.orderStatus);
}]);

laundrynerdsMobileControllers.controller('PricelistCtrl', ['$scope', 'webservice', function ($scope, webservice) {
	$scope.searchText;
	$scope.pricelists = [];

	var loadPricelist = function () {
		webservice.get('pricelist').then(function (pricelists) {
			if (pricelists.data && pricelists.data.length) {
				$scope.pricelists = pricelists.data;
			}
		}, function (error) {
			console.log("Error getting pricelist" + error);
		});
	};
	loadPricelist();
}]);