/**
 * http://usejsdoc.org/
 */

var laundrynerdsAdminControllers = angular.module('laundrynerdsAdminControllers', ['ngCookies']);


// Admin controllers
laundrynerdsAdminControllers.controller('LoginCtrl', ['$scope', 'webservice', function ($scope, webservice) {

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
			if (response.data.active && response.data.role === "Admin") {
				window.location = window.location.origin + "/admin/" + urlHash;
			} else {
				$scope.loginStatus = "Not sufficient previlages";
			}
		}, function (error) {
			$scope.loginStatus = "Username or Password is incorrect!";
		});
	};
}]);

laundrynerdsAdminControllers.controller('CreateOrderCtrl', ['$scope', 'webservice', function ($scope, webservice) {
	var today = new Date(),
		year = today.getFullYear(),
		month = today.getMonth(),
		date = today.getDate();
	var defaultDeliveryDate = new Date();
	var numberOfDaysToAdd = 2;
	defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + numberOfDaysToAdd);
	$scope.today = today.toISOString();
	$scope.salutation = {
		options: ["Mr.", "Ms.", "Mrs."],
		selectedValue: "Mr."
	};
	$scope.fname = null;
	$scope.lname = null;
	$scope.mobile = null;
	$scope.email = null;
	$scope.source = {
		options: ["Retail", "Online", "Cards", "Commercial"],
		selectedValue: "Retail"
	};
	$scope.area = {
		options: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur"],
		selectedValue: "Kukatpally"
	};
	$scope.address = null;
	$scope.pickUpDate = {
		selectedDate: today,
		minDate: today.toISOString(),
		isValid: true,
		validationMessage: ""
	};
	$scope.deliveryDate = {
		selectedDate: defaultDeliveryDate,
		minDate: today.toISOString(),
		isValid: true,
		validationMessage: ""
	};
	$scope.orderNumber = "";
	$scope.items = null;
	$scope.quantity = null;
	$scope.quantityValid = true;
	$scope.amount = null;
	$scope.amountValid = true;

	$scope.uploadSuccess = null;
	$scope.disableButton = false;

	$scope.resetForm = function () {
		$scope.fname = null;
		$scope.lname = null;
		$scope.mobile = null;
		$scope.email = null;
		$scope.items = null;
		$scope.pickUpDate.selectedDate = today;
		$scope.deliveryDate.selectedDate = defaultDeliveryDate;
		$scope.quantity = null;
		$scope.amount = null;
		$scope.address = null;
		$scope.disableButton = false;
	};

	$scope.createOrder = function () {
		$scope.uploadSuccess = null;
		$scope.pickUpDate.validationMessage = "";
		$scope.pickUpDate.isValid = true;
		$scope.deliveryDate.validationMessage = "";
		$scope.deliveryDate.isValid = true;
		$scope.quantityValid = true;
		$scope.amountValid = true;
		var selectedPickupDate = new Date($scope.pickUpDate.selectedDate);
		var selectedDeliveryDate = new Date($scope.deliveryDate.selectedDate);
		if (selectedPickupDate === null || isNaN(selectedPickupDate.getTime())) {
			$scope.pickUpDate.validationMessage = "Not a valid pickup date, enter date in format yyyy-mm-dd";
			$scope.pickUpDate.isValid = false;
		} else if (selectedDeliveryDate === null || isNaN(selectedDeliveryDate.getTime())) {
			$scope.deliveryDate.validationMessage = "Not a valid delivery date, enter date in format yyyy-mm-dd";
			$scope.deliveryDate.isValid = false;
		} else if (selectedPickupDate > selectedDeliveryDate) {
			$scope.deliveryDate.validationMessage = "Delivery date can not be before pickup date.";
			$scope.deliveryDate.isValid = false;
		} else if (isNaN($scope.quantity) || $scope.quantity < 1) {
			$scope.quantityValid = false;
		} else if ($scope.amount !== null && !isNaN($scope.amount) && $scope.amount < 1) {
			$scope.amountValid = false;
		} else {
			$scope.disableButton = true;
			var generalOrderObj = {
				firstName: $scope.fname,
				lastName: $scope.lname,
				gender: $scope.salutation.selectedValue === "Mr." ? "M" : "F",
				mobile: $scope.mobile,
				email: $scope.email,
				pickupDate: $scope.pickUpDate.selectedDate,
				deliveryDate: $scope.deliveryDate.selectedDate,
				locality: $scope.area.selectedValue,
				fullAddress: $scope.address,
				source: $scope.source.selectedValue,
				items: $scope.items,
				quantity: $scope.quantity,
				amount: $scope.amount,
				orderNumber: $scope.orderNumber
			};
			var $btn = $("#create-order-btn").button('loading');
			webservice.post('generalorder', generalOrderObj).then(function (response) {
				$scope.uploadSuccess = true;
				$scope.resetForm();
				$btn.button('reset');
			}, function (error) {
				$scope.uploadSuccess = false;
				$scope.disableButton = false;
				$btn.button('reset');
			});
		}
	};

}]);

laundrynerdsAdminControllers.controller('OrderListCtrl', ['$scope', '$state', 'webservice', 'ordersList', function ($scope, $state, webservice, ordersList) {
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.currentState = $state.current.name;
	$scope.selectedNav = $scope.currentState.substring($scope.currentState.lastIndexOf(".") + 1, $scope.currentState.length);
	var indexOfDetails = $scope.currentState.indexOf(".details");
	if (indexOfDetails > -1) {
		$scope.currentState = $scope.currentState.substring(0, indexOfDetails);
	}
	$scope.orderStatus = {
		options: ["Delivered", "Received", "Delayed", "Ready", "Duplicate", "Picked up", "Cancelled"]
	};
	$scope.comments = "";
	$scope.orders;
	$scope.searchText = "";

	$scope.getLink = function (row) {
		return "#/" + $scope.currentState.replace(/\./g, '/').toLowerCase() + "/" + row._id;
	};

	$scope.lineStatusIndicator = function (deliveryDate) {
		var dd = new Date(deliveryDate);
		var td = new Date();

		var diff = (dd.getTime() - td.getTime()) / (1000 * 3600 * 24);

		if (diff < 0) {
			return "row-risk";
		} else if (diff >= 0 && diff < 2) {
			return "row-delayed";
		}

		return "";
	};

	$scope.updateOrder = function (row) {
		console.log(row);
		var generalOrderObj = {
			orderStatus: row.orderStatus
		};
		var btnId = "#update-order-btn-" + row._id;
		var $btn = $(btnId).button('loading');
		webservice.put('generalorder/' + row._id, generalOrderObj).then(function (response) {
			$btn.button('complete');
			resetButtonWithDelay(btnId);
		}, function (error) {
			$btn.button('error');
			resetButtonWithDelay(btnId);
		});
	};

	if (ordersList.status === 200 && ordersList.data && ordersList.data.length > 0) {
		$scope.orders = ordersList.data;
	} else if (ordersList.status === 401 && ordersList.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.orders = [];
	}

}]);

laundrynerdsAdminControllers.controller('OrderDetailsCtrl', ['$scope', '$state', 'webservice', 'ordersDetails', function ($scope, $state, webservice, ordersDetails) {
	$scope.order;
	$scope.message = "";
	$scope.disableButton = false;

	$scope.updateOrder = function () {
		$scope.disableButton = true;
		webservice.put('generalorder/' + $scope.order._id, $scope.order).then(function (response) {
			$scope.disableButton = false;
		}, function (error) {
			$scope.message = "Error updating order, please try after sometime";
			$scope.disableButton = false;
		});
	};

	$scope.closeView = function () {
		$(".order-details-page").hide(500);
	};

	if (ordersDetails.status === 200 && ordersDetails.data) {
		$scope.order = ordersDetails.data;
		$scope.message = "";
	} else if (ordersDetails.status === 401 && ordersDetails.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.message = "No details found";
	}

	window.scrollTo(0, 0);
}]);


// Custoemrs controllers
laundrynerdsAdminControllers.controller('CustomerDetailsCtrl', ['$scope', '$state', 'webservice', 'ordersList', function ($scope, $state, webservice, ordersList) {
	$scope.customer;
}]);


$('.tree-toggle').click(function () {
	$(this).parent().children('ul.tree').toggle(200);
	$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
	$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
});

// Close all tree except first by default
(function () {
	if (window.location.hash.indexOf('customer/') >= 0) {
		$(".left-nav > .nav-pills > li:first-child > ul.tree").toggle(0);
		$(".left-nav > .nav-pills > li:first-child > .tree-toggle > .glyphicon").toggleClass("glyphicon-chevron-down");
		$(".left-nav > .nav-pills > li:first-child > .tree-toggle > .glyphicon").toggleClass("glyphicon-chevron-right");
	} else {
		$(".left-nav > .nav-pills > li:not(:first-child) > ul.tree").toggle(0);
		$(".left-nav > .nav-pills > li:not(:first-child) > .tree-toggle > .glyphicon").toggleClass("glyphicon-chevron-down");
		$(".left-nav > .nav-pills > li:not(:first-child) > .tree-toggle > .glyphicon").toggleClass("glyphicon-chevron-right");
	}
})();
