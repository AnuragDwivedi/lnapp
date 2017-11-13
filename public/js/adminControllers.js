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

laundrynerdsAdminControllers.controller('CreateOrderCtrl', ['$scope', '$state', 'webservice', function ($scope, $state, webservice) {
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
	$scope.newOrderId = null;
	$scope.newOrderLink = "";
	$scope.userId = null;
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
	$scope.quantityValid = true;
	$scope.amountValid = true;
	$scope.paymentAmountValid = true;
	$scope.paymentModeValid = true;

	$scope.uploadSuccess = null;
	$scope.disableButton = false;
	$scope.customerDetailsDisabled = true;

	$scope.resetForm = function () {
		$scope.userId = null;
		$scope.fname = null;
		$scope.lname = null;
		$scope.mobile = null;
		$scope.email = null;
		$scope.items = [];
		$scope.pickUpDate.selectedDate = today;
		$scope.deliveryDate.selectedDate = defaultDeliveryDate;
		$scope.address = null;
		$scope.disableButton = false;
		$scope.totalQuantity = 0;
		$scope.totalAmount = 0;
		$scope.gstAmount = 0;
		$scope.itemTotal = 0;
		$scope.discount = 0;
		$scope.items.push(new itemObj(false));
		refreshSelectPicker();
	};

	$scope.createOrder = function () {
		$scope.uploadSuccess = null;
		$scope.pickUpDate.validationMessage = "";
		$scope.pickUpDate.isValid = true;
		$scope.deliveryDate.validationMessage = "";
		$scope.deliveryDate.isValid = true;
		$scope.quantityValid = true;
		$scope.amountValid = true;
		$scope.newOrderId = null;
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
		} else if ($scope.totalQuantity < 1) {
			$scope.quantityValid = false;
		} else if ($scope.totalAmount < 1) {
			$scope.amountValid = false;
		} else if ($scope.paymentStatus.selectedValue === "Paid" && $scope.paidAmount <= 0) {
			$scope.paymentAmountValid = false;
		} else if ($scope.paymentStatus.selectedValue === "Paid" && $scope.paymentMode.selectedValue === "") {
			$scope.paymentModeValid = false;
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
				quantity: $scope.totalQuantity,
				itemTotal: $scope.itemTotal,
				gstAmount: $scope.gstAmount,
				discountAmount: $scope.discount,
				totalAmount: $scope.totalAmount,
				paidAmount: $scope.paidAmount,
				paymentMode: $scope.paymentMode.selectedValue,
				paymentStatus: $scope.paymentStatus.selectedValue,
				userId: $scope.userId
			};
			var $btn = $("#create-order-btn").button('loading');
			webservice.post('generalorder', generalOrderObj).then(function (response) {
				$scope.newOrderId = response.data.orderId;
				$scope.newOrderLink = "#!/order/retail/" + response.data._id;
				$scope.uploadSuccess = true;
				$scope.resetForm();
				$btn.button('reset');
				$scope.openInvoice(response.data._id);
			}, function (error) {
				$scope.uploadSuccess = false;
				$scope.disableButton = false;
				$btn.button('reset');
			});
		}
	};
	$scope.openInvoice = function (orderId) {
		var url = window.location.origin + '/admin/invoice.html?orderId=' + orderId;
		window.open(url, '_blank')
	};
	$scope.createLink = function (order) {
		$scope.newOrderLink = "#!/order/retail/" + order._id;
	};

	$scope.resetCustomerFields = function () {
		$scope.userId = null;
		$scope.email = null;
		$scope.fname = null;
		$scope.lname = null;
		var address = null;
		$scope.address = null;
	};

	$scope.loadCustomerDetailsByContact = function () {
		var mobile = $scope.mobile;
		if (mobile) {
			webservice.get('user/mobile/' + mobile).then(function (response) {
				if (response.status === 200 && response.data) {
					var user = response.data;
					$scope.email = user.email;
					$scope.salutation.selectedValue = user.gender === "M" ? "Mr." : "Ms.";
					$scope.fname = user.firstName;
					$scope.lname = user.lastName;
					$scope.area.selectedValue = user.address.locality;
					$scope.address = user.address.address;
					$scope.userId = user._id;
					$scope.customerDetailsDisabled = true;
				} else {
					$scope.resetCustomerFields();
					$scope.customerDetailsDisabled = false;
				}
			}, function (error) {
				$scope.resetCustomerFields();
				$scope.customerDetailsDisabled = false;
			});
		}
	};

	// Item selection
	$scope.washTypes = ["Wash & Iron", "Wash & Fold", "Dry Cleaning", "Dyeing", "Darning", "Rolling"];
	$scope.totalQuantity = 0;
	$scope.totalAmount = 0;
	$scope.gstAmount = 0;
	$scope.itemTotal = 0;
	$scope.discount = 0;
	$scope.pricelists;
	$scope.items = [];
	$scope.gstPercentage = 18;

	function itemObj(isOther) {
		if (!isOther) {
			this.isOtherItem = false;
			this.selectedItem = '';
		} else {
			this.isOtherItem = true;
			this.selectedOtherItem = '';
		}
		this.price = 0;
		this.quantity = 0;
		this.selectedType = $scope.washTypes[0];
		this.description = '';
	};

	$scope.items.push(new itemObj(false));
	$scope.removeItem = function (index) {
		$scope.items.splice(index, 1);
		$scope.updateTotals();
	};
	$scope.addItem = function () {
		$scope.items.push(new itemObj(false));
		refreshSelectPicker();
		$scope.updateTotals();
	};
	$scope.addOtherItem = function () {
		$scope.items.push(new itemObj(true));
		refreshSelectPicker();
		$scope.updateTotals();
	};
	$scope.updateTotals = function () {
		$scope.totalQuantity = 0;
		$scope.totalAmount = 0;
		$scope.gstAmount = 0;
		$scope.itemTotal = 0;
		$scope.items.forEach(function (item, index) {
			$scope.totalQuantity += item.quantity ? item.quantity : 0;
			$scope.itemTotal += (item.quantity ? item.quantity : 0) * (item.price ? item.price : 0);
		});
		$scope.gstAmount = $scope.itemTotal * $scope.gstPercentage / 100;
		var totalAmount = Math.round($scope.itemTotal + $scope.gstAmount - $scope.discount);
		$scope.totalAmount = totalAmount <= 0 ? 0 : totalAmount;
	};

	$scope.paymentStatus = {
		options: ["Not Paid", "Paid"],
		selectedValue: "Not Paid"
	};
	$scope.paymentMode = {
		options: ["Card", "Cash", "PayTM"],
		selectedValue: ""
	};
	$scope.paidAmount = 0;

	$scope.updatePaymentMode = function () {
		if ($scope.paymentMode.selectedValue === "" && $scope.paymentStatus.selectedValue === "Paid") {
			$scope.paymentMode.selectedValue = "Cash";
			$scope.paidAmount = $scope.totalAmount;
		} else if ($scope.paymentStatus.selectedValue === "Not Paid") {
			$scope.paymentMode.selectedValue = "";
			$scope.paidAmount = 0;
		}
	};

	webservice.get('pricelist').then(function (pricelists) {
		if (pricelists.data && pricelists.data.length) {
			$scope.pricelists = pricelists.data;
			refreshSelectPicker();
		}
	}, function (error) {
		console.log("Error getting pricelist" + error);
		refreshSelectPicker();
	});

	// Collapsible
	$('.tree-toggle').click(function () {
		$(this).parent().children('div.tree').toggle(200);
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
	});

	var refreshSelectPicker = function () {
		setTimeout(function () {
			$('.selectpicker').selectpicker();
		}, 1);
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
		return "#!/" + $scope.currentState.replace(/\./g, '/').toLowerCase() + "/" + row._id;
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
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.order;
	$scope.message = "";
	$scope.disableButton = false;
	$scope.orderStatus = {
		options: ["Delivered", "Received", "Delayed", "Ready", "Duplicate", "Picked up", "Cancelled"]
	};
	$scope.paymentStatus = {
		options: ["Not Paid", "Paid"]
	};
	$scope.paymentMode = {
		options: ["Card", "Cash", "PayTM"]
	};

	$scope.updatePaymentMode = function () {
		if ($scope.order.paymentStatus === "Paid") {
			if ($scope.order.paymentMode === "")
				$scope.order.paymentMode = "Cash";
			$scope.order.paidAmount = $scope.order.totalAmount;
		} else if ($scope.order.paymentStatus === "Not Paid") {
			$scope.order.paymentMode = "";
			$scope.order.paidAmount = null;
		}
	};

	$scope.updateTotals = function () {
		var totalAmount = Math.round($scope.order.itemTotal + $scope.order.gstAmount - $scope.order.discountAmount);
		$scope.order.totalAmount = totalAmount <= 0 ? 0 : totalAmount;
		$scope.updatePaymentMode();
	};

	$scope.updateOrder = function () {
		$scope.disableButton = true;
		var generalOrderObj = {
			orderStatus: $scope.order.orderStatus,
			discountAmount: $scope.order.discountAmount,
			paidAmount: $scope.order.paidAmount,
			paymentMode: $scope.order.paymentMode,
			paymentStatus: $scope.order.paymentStatus,
			totalAmount: $scope.order.totalAmount
		};
		var btnId = "#update-order-list-button";
		var $btn = $(btnId).button('Saving...');
		webservice.put('generalorder/' + $scope.order._id, generalOrderObj).then(function (response) {
			$btn.button('complete');
			resetButtonWithDelay(btnId);
			$scope.disableButton = false;
		}, function (error) {
			$btn.button('error');
			resetButtonWithDelay(btnId);
			$scope.disableButton = false;
		});
	};

	$scope.closeView = function () {
		$(".order-details-page").hide(500);
	};

	$scope.openInvoice = function (orderId) {
		var url = window.location.origin + '/admin/invoice.html?orderId=' + orderId;
		window.open(url, '_blank')
	};

	$scope.getInvoiceLink = function (orderId) {
		var url = window.location.origin + '/admin/invoice.html?orderId=' + orderId;
		return url;
	};

	$scope.getTagsLink = function (orderId) {
		var url = window.location.origin + '/admin/tags.html?orderId=' + orderId;
		return url;
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


// Customers controllers
laundrynerdsAdminControllers.controller('CustomerDetailsCtrl', ['$scope', '$state', 'webservice', function ($scope, $state, webservice) {
	$scope.searchText;
	$scope.disableSearchButton = false;
	$scope.customers = [];
	$scope.searchSuccess = true;
	$scope.errorMessage = "";
	$scope.salutations = [{
		label: 'Male',
		value: 'M'
	}, {
		label: 'Female',
		value: 'F'
	}];

	$scope.searchCustomer = function () {
		$scope.disableSearchButton = true;
		$scope.customers = [];
		$scope.errorMessage = "";
		$scope.searchSuccess = true;
		webservice.get('user/search/' + $scope.searchText).then(function (response) {
			$scope.disableSearchButton = false;
			if (response.status === 200 && response.data.length) {
				$scope.searchSuccess = true;
				$scope.customers = response.data;
			} else {
				$scope.errorMessage = "No records found";
				$scope.searchSuccess = false;
			}
		}, function (error) {
			$scope.disableSearchButton = false;
			$scope.errorMessage = "Error loading data, please try after sometimes.";
			$scope.searchSuccess = false;
		});
	};

	$scope.isEditing = false;
	$scope.savedData = {};

	$scope.editCustomer = function (row) {
		row.isEditing = true;
		$scope.savedData[row._id] = $.extend(false, {}, row);
	};
	$scope.saveEditCustomer = function (row) {
		$scope.errorMessage = "";
		var customerObj = {
			firstName: row.firstName,
			lastName: row.lastName,
			email: row.email,
			gender: row.gender
		};
		var btnId = "#update-customer-btn-" + row._id;
		var $btn = $(btnId).button('loading');
		webservice.put('user/' + row._id, customerObj).then(function (response) {
			$btn.button('complete');
			row.isEditing = false;
		}, function (error) {
			$btn.button('error');
			row = $.extend(true, row, $scope.savedData[row._id]);
			$scope.errorMessage = "Error updating user, please try after some time.";
			row.isEditing = false;
		});
	};
	$scope.cancelEditCustomer = function (row) {
		row = $.extend(true, row, $scope.savedData[row._id]);
		row.isEditing = false;
	};
}]);

laundrynerdsAdminControllers.controller('CustomerCreateCtrl', ['$scope', '$state', 'webservice', function ($scope, $state, webservice) {
	$scope.salutation = {
		options: ["Mr.", "Ms.", "Mrs."],
		selectedValue: "Mr."
	};
	$scope.fname = null;
	$scope.lname = null;
	$scope.mobile = null;
	$scope.email = null;
	$scope.area = {
		options: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur"],
		selectedValue: "Kukatpally"
	};
	$scope.address = null;

	$scope.uploadSuccess = null;
	$scope.disableButton = false;
	$scope.errorMessage = "";

	$scope.resetForm = function () {
		$scope.fname = null;
		$scope.lname = null;
		$scope.mobile = null;
		$scope.email = null;
		$scope.address = null;
		$scope.disableButton = false;
	};

	$scope.addCustomer = function () {
		$scope.uploadSuccess = null;
		$scope.disableButton = true;
		$scope.errorMessage = "";
		if ($scope.mobile && $scope.mobile.toString().length !== 10) {
			$scope.uploadSuccess = false;
			$scope.errorMessage = "Enter 10 digits mobile number";
			return;
		}
		var customerObj = {
			firstName: $scope.fname,
			lastName: $scope.lname,
			gender: $scope.salutation.selectedValue === "Mr." ? "M" : "F",
			mobile: $scope.mobile,
			email: $scope.email,
			locality: $scope.area.selectedValue,
			fullAddress: $scope.address
		};
		var $btn = $("#create-customer-btn").button('loading');
		webservice.post('user', customerObj).then(function (response) {
			$scope.uploadSuccess = true;
			$scope.resetForm();
			$btn.button('reset');
		}, function (error) {
			if (error.status === 409) {
				$scope.errorMessage = error.data;
			} else {
				$scope.errorMessage = "Error creating user, please try after some time.";
			}
			$scope.uploadSuccess = false;
			$scope.disableButton = false;
			$btn.button('reset');
		});
	};
}]);

laundrynerdsAdminControllers.controller('InvoiceCtrl', ['$scope', 'webservice', 'util', function ($scope, webservice, util) {
	$scope.numberOfInvoices = ["1", "2"];
	$scope.today = new Date();
	$scope.order;
	$scope.orderId;

	$scope.fetchOrderDetails = function () {
		webservice.fetchOrderDetails($scope.orderId).then(function (orderDetails) {
			if (orderDetails.data) {
				$scope.order = orderDetails.data;
			} else {
				alert("Cannot generate invoce for given order, please try later.");
			}
		}, function (error) {
			console.log("Error getting pricelist" + error);
			alert("Cannot generate invoce, please try later.");
		});
	};

	$scope.printContent = function (domId) {
		var printContents = document.getElementById(domId).innerHTML;
		var originalContents = document.body.innerHTML;

		document.body.innerHTML = printContents;

		window.print();

		document.body.innerHTML = originalContents;

		return true;
	};

	(function () {
		$scope.orderId = util.getUrlParameter('orderId');
		$scope.fetchOrderDetails();
	})();
}]);

laundrynerdsAdminControllers.controller('TagsCtrl', ['$scope', 'webservice', 'util', function ($scope, webservice, util) {
	$scope.today = new Date();
	$scope.order;
	$scope.orderId;
	$scope.items = [];
	$scope.tagStart = 1;

	$scope.range = function (min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
			//++$scope.tagStart;
		}
		return input;
	};

	$scope.updateItemsArr = function (items) {
		var count = 1;
		items.forEach(function (item) {
			for (var i = 0; i < item.quantity; i++) {
				var newItem = $.extend({}, item);
				newItem.itemIndex = function (j) {
					return function () {
						return j;
					}();
				}(count);
				count++;
				$scope.items.push(newItem);
			}
		});
	};

	$scope.fetchOrderDetails = function () {
		webservice.fetchOrderDetails($scope.orderId).then(function (orderDetails) {
			if (orderDetails.data) {
				$scope.order = orderDetails.data;
				$scope.updateItemsArr(orderDetails.data.items);
			} else {
				alert("Cannot generate tags for given order, please try later.");
			}
		}, function (error) {
			alert("Cannot generate tags, please try later.");
		});
	};

	(function () {
		$scope.orderId = util.getUrlParameter('orderId');
		$scope.fetchOrderDetails();
	})();
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
