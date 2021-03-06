/**
 * http://usejsdoc.org/
 */

var laundrynerdsAdminControllers = angular.module('laundrynerdsAdminControllers', ['ngCookies', 'laundrynerdsDirectives']);


// Admin controllers
laundrynerdsAdminControllers.controller('LoginCtrl', ['$scope', 'webservice', 'util', '$sessionStorage', function ($scope, webservice, util, $sessionStorage) {

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
			if (response.data.active && util.hasAdminRole()) {
				window.location = window.location.origin + "/admin/" + urlHash;
			} else {
				$scope.loginStatus = "Not sufficient previlages";
			}
		}, function (error) {
			$scope.loginStatus = "Username or Password is incorrect!";
		});
	};
}]);


// Order controllers
laundrynerdsAdminControllers.controller('CreateOrderCtrl', ['$scope', '$state', 'webservice', 'lookup', function ($scope, $state, webservice, lookup) {
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
		options: ["Retail", "Online"],
		selectedValue: "Retail"
	};
	$scope.area = {
		options: lookup.areasCovered,
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
		$scope.paidAmount = 0;
		$scope.paymentStatus.selectedValue = "Not Paid";
		$scope.paymentMode.selectedValue = "";
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
	$scope.washTypes = lookup.washTypes;
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
		if ($scope.paymentStatus.selectedValue === "Paid") {
			$scope.paidAmount = $scope.totalAmount;
		}
	};

	$scope.paymentStatus = {
		options: lookup.paymentStatuses,
		selectedValue: "Not Paid"
	};
	$scope.paymentMode = {
		options: lookup.paymentModes,
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
		refreshSelectPicker();
	});

	var refreshSelectPicker = function () {
		setTimeout(function () {
			$('.create-order-items').selectpicker();
		}, 1);
	};

	// Collapsible
	$('.child-tree-toggle').click(function () {
		$(this).parent().children('div.tree').toggle(200);
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
	});
}]);

laundrynerdsAdminControllers.controller('OrderListCtrl', ['$scope', '$state', 'webservice', 'lookup', 'ordersList', function ($scope, $state, webservice, lookup, ordersList) {
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
		options: lookup.orderStatuses
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

laundrynerdsAdminControllers.controller('OrderDetailsCtrl', ['$scope', '$state', 'webservice', 'lookup', 'ordersDetails', function ($scope, $state, webservice, lookup, ordersDetails) {
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.order;
	$scope.message = "";
	$scope.disableButton = false;
	$scope.orderStatus = {
		options: lookup.orderStatuses
	};
	$scope.paymentStatus = {
		options: lookup.paymentStatuses
	};
	$scope.paymentMode = {
		options: lookup.paymentModes
	};
	$scope.washTypes = lookup.washTypes;
	$scope.gstPercentage = 18;

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
		$scope.order.totalQty = 0;
		$scope.order.totalAmount = 0;
		$scope.order.gstAmount = 0;
		$scope.order.itemTotal = 0;
		$scope.order.items.forEach(function (item, index) {
			$scope.order.totalQty += item.quantity ? item.quantity : 0;
			$scope.order.itemTotal += (item.quantity ? item.quantity : 0) * (item.price ? item.price : 0);
		});
		$scope.order.gstAmount = $scope.order.itemTotal * $scope.gstPercentage / 100;
		var totalAmount = Math.round($scope.order.itemTotal + $scope.order.gstAmount - ($scope.order.discountAmount ? $scope.order.discountAmount : 0));
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
			totalAmount: $scope.order.totalAmount,
			itemTotal: $scope.order.itemTotal,
			gstAmount: $scope.order.gstAmount,
			totalQty: $scope.order.totalQty,
			items: $scope.order.items
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

	$scope.removeItem = function (index) {
		$scope.order.items.splice(index, 1);
		$scope.updateTotals();
	};
	$scope.addItem = function () {
		$scope.order.items.push(new itemObj(false));
		refreshSelectPicker();
		$scope.updateTotals();
	};
	$scope.addOtherItem = function () {
		$scope.order.items.push(new itemObj(true));
		refreshSelectPicker();
		$scope.updateTotals();
	};

	webservice.get('pricelist').then(function (pricelists) {
		if (pricelists.data && pricelists.data.length) {
			$scope.pricelists = pricelists.data;
			refreshSelectPicker();
		}
	}, function (error) {
		refreshSelectPicker();
	});

	var refreshSelectPicker = function () {
		setTimeout(function () {
			$('.itempicker').selectpicker();
		}, 1);
	};

	$scope.closeView = function () {
		if (window.history.length > 2) {
			window.history.back();
		} else {
			window.location = window.location.hash.substr(0, window.location.hash.lastIndexOf("/"));
		}
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
		$scope.order.items = $scope.order.items ? $scope.order.items : [];
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

	$scope.resetForm = function (resetMobile) {
		$scope.fname = null;
		$scope.lname = null;
		$scope.email = null;
		$scope.address = null;
		$scope.disableButton = false;
		if (resetMobile) {
			$scope.mobile = null;
		}
	};

	$scope.customerDetailsDisabled = true;
	$scope.isExistingCustomer = false;
	$scope.loadCustomerDetailsByContact = function () {
		var mobile = $scope.mobile;
		$scope.uploadSuccess = null;
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
					$scope.isExistingCustomer = true;
					$scope.customerDetailsDisabled = true;
				} else {
					$scope.resetForm(false);
					$scope.isExistingCustomer = false;
					$scope.customerDetailsDisabled = false;
				}
			}, function (error) {
				$scope.resetForm(false);
				$scope.isExistingCustomer = false;
				$scope.customerDetailsDisabled = false;
			});
		}
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
			$scope.resetForm(true);
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

	$scope.isSubscription = false;
	$scope.fetchOrderDetails = function () {
		$scope.isSubscription = !!util.getUrlParameter('subscription');
		var getOrders = $scope.isSubscription ? webservice.fetchSubscriptionOrderById($scope.orderId) : webservice.fetchOrderDetails($scope.orderId);
		getOrders.then(function (orderDetails) {
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


// Subscription controllers
laundrynerdsAdminControllers.controller('SubscriptionManageCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'subscriptionList', function ($scope, $state, $sessionStorage, webservice, subscriptionList) {
	$scope.isEditing = false;

	$scope.subscriptionTypes = [{
		label: 'Per piece',
		value: 'per_piece'
	}, {
		label: 'Per KG',
		value: 'per_kg'
	}];

	$scope.categories = [{
		label: 'Online',
		value: 'Online'
	}, {
		label: 'Retail',
		value: 'Retail'
	}];

	$scope.saveEditSubscription = function (row) {
		$scope.errorMessage = "";
		var subscriptionObj = {
			description: row.description,
			numberOfClothes: row.numberOfClothes,
			numberOfPickups: row.numberOfPickups,
			price: row.price,
			type: row.subscriptionType,
			category: row.category,
			isEnabled: row.isEnabled,
			duration: row.duration
		};
		var btnId = "#update-subscription-btn-" + row._id;
		var $btn = $(btnId).button('loading');
		webservice.put('subscription/' + row._id, subscriptionObj).then(function (response) {
			$btn.button('complete');
			row.isEditing = false;
			delete $sessionStorage["subscription"];
			delete $sessionStorage["subscription?isEnabled=true"];
		}, function (error) {
			$btn.button('error');
			row = $.extend(true, row, $scope.savedData[row._id]);
			$scope.errorMessage = "Error updating user, please try after some time.";
			row.isEditing = false;
		});
	};
	$scope.savedData = {};
	$scope.editSubscription = function (row) {
		row.description = row.description ? row.description : "";
		row.duration = row.duration ? row.duration : "";
		$scope.savedData[row._id] = $.extend(false, {}, row);
		row.isEditing = true;
	};
	$scope.cancelEditSubscription = function (row) {
		row = $.extend(true, row, $scope.savedData[row._id]);
		row.isEditing = false;
	};

	$scope.newSubscriptionObj = {
		packageName: '',
		packageDisplayName: '',
		subscriptionType: 'per_piece',
		description: '',
		numberOfClothes: '',
		numberOfPickups: '',
		price: '',
		duration: '',
		category: 'Online',
		isEnabled: true
	};
	$scope.saveSubscription = function (formData) {
		formData.packageName = formData.packageDisplayName.toLocaleLowerCase().split(" ").join("_");
		webservice.post('subscription', formData).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["subscription"];
				delete $sessionStorage["subscription?isEnabled=true"];
				loadSubscriptions();
			}
		}).finally(function () {
			$('#addSubscriptionModel').modal('hide');
		});
	};

	var loadSubscriptions = function () {
		webservice.fetchSubscriptions().then(function (subscriptionList) {
			showSubscriptions(subscriptionList);
		});
	};
	var showSubscriptions = function (subscriptionList) {
		if (subscriptionList.status === 200 && subscriptionList.data && subscriptionList.data.length > 0) {
			$scope.subscriptions = subscriptionList.data;
		} else if (subscriptionList.status === 401 && subscriptionList.statusText === "Unauthorized") {
			window.location = "login.html";
		} else {
			$scope.subscriptions = [];
		}
	};
	showSubscriptions(subscriptionList);
}]);

laundrynerdsAdminControllers.controller('SubscriptionEnrollCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'subscriptionList', function ($scope, $state, $sessionStorage, webservice, subscriptionList) {
	$scope.salutation = {
		options: ["Mr.", "Ms.", "Mrs."],
		selectedValue: "Mr."
	};
	$scope.newEnrollmentId = null;
	$scope.newEnrollmentLink = "";
	$scope.userId = null;
	$scope.fname = null;
	$scope.lname = null;
	$scope.mobile = null;
	$scope.email = null;
	$scope.area = {
		options: ["Madhapur", "Hitec City", "Kondapur", "Kothaguda", "Kukatpally", "Gachibowli", "Hafeezpet", "Indira Nagar", "Miyapur"],
		selectedValue: "Kukatpally"
	};

	$scope.address = null;
	$scope.subscriptions = {
		options: [],
		selectedValue: null,
		selectedObj: {},
		isValid: true
	};

	// Setting available subscriptions
	if (subscriptionList.status === 200 && subscriptionList.data && subscriptionList.data.length > 0) {
		$scope.subscriptions.options = subscriptionList.data;
	} else if (subscriptionList.status === 401 && subscriptionList.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.subscriptions.options = [];
	}

	$scope.paidAmount = $scope.totalAmount = 0;
	$scope.paymentAmountValid = true;
	$scope.paymentModeValid = true;

	$scope.uploadSuccess = null;
	$scope.disableButton = false;
	$scope.customerDetailsDisabled = true;

	$scope.subscriptionSelectHandler = function () {
		$scope.subscriptions.selectedObj = JSON.parse($scope.subscriptions.selectedValue);
		$scope.subscriptions.isValid = true;
		$scope.totalAmount = $scope.subscriptions.selectedObj.price;
	};

	$scope.resetForm = function () {
		$scope.userId = null;
		$scope.fname = null;
		$scope.lname = null;
		$scope.mobile = null;
		$scope.email = null;
		$scope.address = null;
		$scope.disableButton = false;
		$scope.paidAmount = 0;
		$scope.paymentStatus.selectedValue = "Not Paid";
		$scope.paymentMode.selectedValue = "";
	};

	$scope.createEnrollment = function () {
		$scope.uploadSuccess = null;
		$scope.newEnrollmentId = null;
		$scope.subscriptions.isValid = true;
		if ($scope.subscriptions.selectedValue === null) {
			$scope.subscriptions.isValid = false;
		} else if ($scope.paymentStatus.selectedValue === "Paid" && $scope.paidAmount <= 0) {
			$scope.paymentAmountValid = false;
		} else if ($scope.paymentStatus.selectedValue === "Paid" && $scope.paymentMode.selectedValue === "") {
			$scope.paymentModeValid = false;
		} else {
			$scope.disableButton = true;
			var subscriptionEnrollmentObj = {
				firstName: $scope.fname,
				lastName: $scope.lname,
				gender: $scope.salutation.selectedValue === "Mr." ? "M" : "F",
				mobile: $scope.mobile,
				email: $scope.email,
				locality: $scope.area.selectedValue,
				fullAddress: $scope.address,
				paidAmount: $scope.paidAmount,
				paymentMode: $scope.paymentMode.selectedValue,
				paymentStatus: $scope.paymentStatus.selectedValue,
				subscriptionId: $scope.subscriptions.selectedObj._id,
				clothesRemaining: $scope.subscriptions.selectedObj.numberOfClothes,
				userId: $scope.userId
			};
			var $btn = $("#create-order-btn").button('loading');
			webservice.post('subscriptionenroll', subscriptionEnrollmentObj).then(function (response) {
				$scope.newEnrollmentId = response.data.subscriptionEnrollmentId;
				//$scope.newOrderLink = "#!/order/retail/" + response.data._id;
				$scope.uploadSuccess = true;
				$scope.resetForm();
				$btn.button('reset');
				//$scope.openInvoice(response.data._id);
				delete $sessionStorage["subscriptionenroll"];
				delete $sessionStorage["subscriptionenroll?isActive=true"];
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
					$scope.area.selectedValue = (user.address && user.address.locality ? user.address.locality : "");
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

	// Collapsible
	$('.child-tree-toggle').click(function () {
		$(this).parent().children('div.tree').toggle(200);
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
	});
}]);

laundrynerdsAdminControllers.controller('SubscriptionEnrollmentsCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'lookup', 'enrollments', function ($scope, $state, $sessionStorage, webservice, lookup, enrollments) {
	$scope.enrollments = [];
	$scope.searchText;
	$scope.actionMessage = "";
	$scope.paymentMode = {
		options: lookup.paymentModes,
		selectedValue: ""
	};
	$scope.paidAmount = 0;
	$scope.paymentAmountValid = true;
	$scope.paymentModeValid = true;

	$scope.enrollmentClickHandler = function (row) {
		row.isExpanded = !row.isExpanded;
	};

	$scope.isPaymentPending = function (row) {
		if (row.paymentStatus === "Not Paid" && row.paidAmount === 0) {
			return true;
		}
		return false;
	};
	$scope.isRenew = function (row) {
		var sinceRenewed = (new Date() - new Date(row.lastRenewed)) / (86400000 /*1000 * 3600 * 24*/ );
		return (sinceRenewed > row.subscription.duration) || row.clothesRemaining <= 0;
	};
	$scope.getActiveTillDate = function (row) {
		var lastRenewed = new Date(row.lastRenewed);
		lastRenewed.setDate(lastRenewed.getDate() + row.subscription.duration);

		return lastRenewed;
	};

	$scope.confirmObj = {};
	$scope.cancelSubscriptionHandler = function (row) {
		$scope.confirmObj.confirmFor = "Cancel";
		$scope.confirmObj.isCancel = true;
		$scope.confirmObj.record = row;
	};
	$scope.renewSubscriptionHandler = function (row, isPaid) {
		$scope.confirmObj = {};
		$scope.confirmObj.confirmFor = "Renew";
		$scope.confirmObj.isRenew = true;
		$scope.confirmObj.record = row;
		if (isPaid) {
			$scope.paidAmount = row.subscription.price;
			$('#paymentModal').modal('show');
		}
	};
	$scope.paymentSubscriptionHandler = function (row) {
		$scope.confirmObj = {};
		$scope.confirmObj.isPaid = true;
		$scope.confirmObj.record = row;
		$scope.paidAmount = row.subscription.price;
		$('#paymentModal').modal('show');
	};
	$scope.confirmRenewPay = function () {
		renewEnrollment($scope.confirmObj.record, true);
	};
	$scope.confirmRenewPay = function () {
		payEnrollment($scope.confirmObj.record);
	};

	var cancelEnrollment = function (recordId) {
		webservice.delete('subscriptionenroll/' + recordId).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["subscriptionenroll"];
				delete $sessionStorage["subscriptionenroll?isActive=true"];
				loadEnrollments();
			} else {
				$scope.actionMessage = "Error deleting enrollment, please try after sometime.";
			}
		}, function () {
			$scope.actionMessage = "Error deleting enrollment, please try after sometime.";
		});
	};

	var renewEnrollment = function (record, isPaid) {
		var renewObj = {
			clothes: record.subscription.numberOfClothes
		};
		if (isPaid) {
			renewObj.paymentStatus = "Paid";
			renewObj.paymentMode = $scope.paymentMode.selectedValue;
			renewObj.paidAmount = $scope.paidAmount;
		}
		webservice.put('subscriptionenroll/' + record._id + '/renew', renewObj).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["subscriptionenroll"];
				delete $sessionStorage["subscriptionenroll?isActive=true"];
				loadEnrollments();
				$scope.actionMessage = "Subscription " + record.subscriptionEnrollmentId + " renewed successfully.";
			} else {
				$scope.actionMessage = "Error renewing subscription " + record.subscriptionEnrollmentId + ", please try after sometime.";
			}
		}, function () {
			$scope.actionMessage = "Error renewing subscription " + record.subscriptionEnrollmentId + ", please try after sometime.";
		});
	};
	var payEnrollment = function (record) {
		var renewObj = {
			paymentStatus: "Paid",
			paymentMode: $scope.paymentMode.selectedValue,
			paidAmount: $scope.paidAmount
		}
		webservice.put('subscriptionenroll/' + record._id + '/pay', renewObj).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["subscriptionenroll"];
				delete $sessionStorage["subscriptionenroll?isActive=true"];
				loadEnrollments();
				$scope.actionMessage = "Subscription " + record.subscriptionEnrollmentId + " paid successfully.";
			} else {
				$scope.actionMessage = "Error making payment for subscription " + record.subscriptionEnrollmentId + ", please try after sometime.";
			}
		}, function () {
			$scope.actionMessage = "Error making payment for subscription " + record.subscriptionEnrollmentId + ", please try after sometime.";
		});
	};

	$scope.updateCustomerEnrollment = function () {
		$scope.paymentModeValid = true;
		$scope.paymentAmountValid = true;
		if ($scope.paymentMode.selectedValue === "") {
			$scope.paymentModeValid = false;
			return;
		}
		if ($scope.paidAmount <= 0) {
			$scope.paymentAmountValid = false;
			return;
		}
		$('#paymentModal').modal('hide');
		if ($scope.confirmObj.isRenew) {
			renewEnrollment($scope.confirmObj.record, true);
		} else if ($scope.confirmObj.isPaid) {
			payEnrollment($scope.confirmObj.record);
		}
	};

	$scope.cancelUpdate = function () {
		$scope.paymentModeValid = true;
		$scope.paymentAmountValid = true;
		$scope.paymentMode.selectedValue = "";
		$scope.paidAmount = 0;
	};

	$scope.confirmClickHandler = function () {
		$scope.actionMessage = "";
		if ($scope.confirmObj.isCancel) {
			cancelEnrollment($scope.confirmObj.record._id);
		} else if ($scope.confirmObj.isRenew) {
			renewEnrollment($scope.confirmObj.record);
		}
		$scope.confirmObj = {};
	};

	var loadEnrollments = function () {
		webservice.fetchEnrollments(true).then(function (enrollments) {
			showEnrollments(enrollments);
		});
	};
	var showEnrollments = function (enrollments) {
		if (enrollments.status === 200 && enrollments.data && enrollments.data.length) {
			$scope.enrollments = enrollments.data;
		} else if (enrollments.status === 401 && enrollments.statusText === "Unauthorized") {
			window.location = "login.html";
		} else {
			$scope.enrollments = [];
		}
	};
	showEnrollments(enrollments);

	$scope.washTypes = lookup.washTypes;
	var today = new Date(),
		year = today.getFullYear(),
		month = today.getMonth(),
		date = today.getDate();
	var defaultDeliveryDate = new Date();
	var numberOfDaysToAdd = 2;
	defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + numberOfDaysToAdd);

	function itemObj(isOther) {
		if (!isOther) {
			this.isOtherItem = false;
			this.selectedItem = '';
		} else {
			this.isOtherItem = true;
			this.selectedOtherItem = '';
		}
		this.quantity = 0;
		this.selectedType = $scope.washTypes[0];
		this.description = '';
	};
	$scope.addSubscriptionOrderHandler = function (e) {
		e.isAddingOrder = true;
		if (!e.items) {
			e.pickupDate = today;
			e.deliveryDate = defaultDeliveryDate;
			loadPricelistPicker();
			e.items = [];
			e.items.push(new itemObj(false));
		}
	};

	$scope.removeItem = function (index, e) {
		e.items.splice(index, 1);
	};
	$scope.addItem = function (e) {
		e.items.push(new itemObj(false));
		refreshSelectPicker();
	};
	$scope.addOtherItem = function (e) {
		e.items.push(new itemObj(true));
		refreshSelectPicker();
	};

	$scope.createSubscriptionOrder = function (e) {
		var totalQuantity = 0;
		e.items.forEach(function (item, index) {
			totalQuantity += item.quantity ? item.quantity : 0;
		});
		var orderObj = {
			pickupDate: e.pickupDate,
			deliveryDate: e.deliveryDate,
			quantity: totalQuantity,
			items: e.items,
			instructions: "",
			subscriptionEnrollmentId: e._id
		};
		var $btn = $('#save-order-btn-' + e._id).button('loading');
		webservice.post('subscriptionorder', orderObj).then(function (response) {
			if (response.status === 200) {
				e.clothesRemaining = e.clothesRemaining - totalQuantity;
				//e.isAddingOrder = false;
				$btn.button('complete');
				delete $sessionStorage["subscriptionenroll"];
				delete $sessionStorage["subscriptionenroll?isActive=true"];
				delete $sessionStorage["subscriptionorder"];
			}
		}, function (err) {
			$btn.button('error');
		});
	};

	var loadPricelistPicker = function () {
		webservice.get('pricelist').then(function (pricelists) {
			if (pricelists.data && pricelists.data.length) {
				$scope.pricelists = pricelists.data;
				refreshSelectPicker();
			}
		}, function (error) {
			refreshSelectPicker();
		});
	};

	var refreshSelectPicker = function () {
		setTimeout(function () {
			$('.subscription-order-items').selectpicker();
		}, 1);
	};
}]);

laundrynerdsAdminControllers.controller('SubscriptionOrderListCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'lookup', 'ordersList', function ($scope, $state, $sessionStorage, webservice, lookups, ordersList) {
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.orderStatuses = lookups.orderStatuses;
	$scope.orders;
	$scope.searchText = "";

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
		var orderObj = {
			orderStatus: row.orderStatus
		};
		var btnId = "#update-subscription-order-btn-" + row._id;
		var $btn = $(btnId).button('loading');
		webservice.put('subscriptionorder/' + row._id, orderObj).then(function (response) {
			$btn.button('complete');
			delete $sessionStorage["subscriptionorder"];
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

laundrynerdsAdminControllers.controller('SubscriptionOrderDetailsCtrl', ['$scope', '$state', '$sessionStorage', 'webservice', 'lookup', 'ordersDetails', function ($scope, $state, $sessionStorage, webservice, lookup, ordersDetails) {
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.order;
	$scope.message = "";
	$scope.disableButton = false;
	$scope.orderStatus = {
		options: lookup.orderStatuses
	};
	$scope.washTypes = lookup.washTypes;

	function itemObj(isOther) {
		if (!isOther) {
			this.isOtherItem = false;
			this.selectedItem = '';
		} else {
			this.isOtherItem = true;
			this.selectedOtherItem = '';
		}
		this.quantity = 0;
		this.selectedType = $scope.washTypes[0];
		this.description = '';
	};

	$scope.removeItem = function (index) {
		$scope.order.items.splice(index, 1);
		$scope.updateTotals();
	};
	$scope.addItem = function () {
		$scope.order.items.push(new itemObj(false));
		refreshSelectPicker();
		$scope.updateTotals();
	};
	$scope.addOtherItem = function () {
		$scope.order.items.push(new itemObj(true));
		refreshSelectPicker();
		$scope.updateTotals();
	};

	$scope.updateTotals = function () {
		$scope.order.totalQty = 0;
		$scope.order.items.forEach(function (item, index) {
			$scope.order.totalQty += item.quantity ? item.quantity : 0;
		});
	};

	webservice.get('pricelist').then(function (pricelists) {
		if (pricelists.data && pricelists.data.length) {
			$scope.pricelists = pricelists.data;
			refreshSelectPicker();
		}
	}, function (error) {
		refreshSelectPicker();
	});

	$scope.updateOrder = function () {
		$scope.disableButton = true;
		var orderObj = {
			orderStatus: $scope.order.orderStatus,
			totalQty: $scope.order.totalQty,
			items: $scope.order.items,
			subscriptionEnrollmentId: $scope.order.subscriptionEnrollmentId._id
		};
		var btnId = "#update-subscription-order-button";
		var $btn = $(btnId).button('Saving...');
		webservice.put('subscriptionorder/' + $scope.order._id, orderObj).then(function (response) {
			$btn.button('complete');
			resetButtonWithDelay(btnId);
			$scope.disableButton = false;
			delete $sessionStorage["subscriptionenroll"];
			delete $sessionStorage["subscriptionenroll?isActive=true"];
			delete $sessionStorage["subscriptionorder"];
		}, function (error) {
			$btn.button('error');
			resetButtonWithDelay(btnId);
			$scope.disableButton = false;
		});
	};

	var refreshSelectPicker = function () {
		setTimeout(function () {
			$('.subscription-order-itempicker').selectpicker();
		}, 1);
	};

	$scope.closeView = function () {
		if (window.history.length > 2) {
			window.history.back();
		} else {
			window.location = window.location.hash.substr(0, window.location.hash.lastIndexOf("/"));
		}
	};

	$scope.openInvoice = function (orderId) {
		var url = window.location.origin + '/admin/invoice.html?orderId=' + orderId;
		window.open(url, '_blank');
	};

	$scope.getInvoiceLink = function (orderId) {
		var url = window.location.origin + '/admin/invoice.html?orderId=' + orderId;
		return url;
	};

	$scope.getTagsLink = function (orderId) {
		var url = window.location.origin + '/admin/tags.html?orderId=' + orderId + '&subscription=true';
		return url;
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

	window.scrollTo(0, 0);
}]);


// Administration controllers
laundrynerdsAdminControllers.controller('PricelistCtrl', ['$scope', '$sessionStorage', 'webservice', function ($scope, $sessionStorage, webservice) {
	var resetButtonWithDelay = function (btnId, delay) {
		window.setTimeout(function () {
			$(btnId).button('reset');
		}, !!delay ? !!delay : 5000);
	};
	$scope.searchText;
	$scope.pricelists = [];

	$scope.updatePricelist = function (row) {
		var obj = {
			laundryPrice: row.laundryPrice,
			drycleanPrice: row.drycleanPrice,
			ironPrice: row.ironPrice
		};
		var btnId = "#update-pricelist-btn-" + row._id;
		var $btn = $(btnId).button('Saving...');
		webservice.put('pricelist/' + row._id, obj).then(function () {
			$btn.button('complete');
			resetButtonWithDelay(btnId);
			delete $sessionStorage["pricelist"];
		}, function (error) {
			$btn.button('error');
			resetButtonWithDelay(btnId);
		});
	};

	$scope.newItemCategories = {
		"options": ["Mens", "Ladies", "Common", "Children", "Homewear"],
		selectedVal: "Mens"
	};
	$scope.newItemObj = {
		itemName: '',
		itemDisplayName: '',
		laundryPrice: '',
		drycleanPrice: '',
		ironPrice: '',
		pricelistType: 'per_piece'
	};
	$scope.saveItem = function (formData) {
		formData.itemName = formData.itemDisplayName.toLowerCase().split(" ").join("-") + "-" + $scope.newItemCategories.selectedVal.toLowerCase();
		webservice.post('pricelist', formData).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["pricelist"];
				loadPricelist();
			}
		}).finally(function () {
			$scope.newItemObj.itemDisplayName = '';
			$scope.newItemObj.laundryPrice = '';
			$scope.newItemObj.drycleanPrice = '';
			$scope.newItemObj.ironPrice = '';
			$('#addItemModal').modal('hide');
		});
	};

	$scope.confirmObj = {};
	$scope.removePricelistItemHandler = function (row) {
		$scope.confirmObj.confirmFor = "Delete";
		$scope.confirmObj.isDelete = true;
		$scope.confirmObj.record = row;
	};

	$scope.confirmClickHandler = function () {
		$scope.actionMessage = "";
		if ($scope.confirmObj.isDelete) {
			deletePricelistItem($scope.confirmObj.record._id);
		}
		$scope.confirmObj = {};
	};
	var deletePricelistItem = function (id) {
		webservice.delete('pricelist/' + id).then(function (response) {
			if (response.status === 200) {
				delete $sessionStorage["pricelist"];
				loadPricelist();
			} else {
				$scope.actionMessage = "Error deleting enrollment, please try after sometime.";
			}
		}, function () {
			$scope.actionMessage = "Error deleting enrollment, please try after sometime.";
		});
	};

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


// Commercial Controllers
laundrynerdsAdminControllers.controller('CommercialCreateCtrl', ['$scope', '$sessionStorage', 'lookup', 'webservice', function ($scope, $sessionStorage, lookup, webservice) {
	$scope.lookup = lookup;
	$scope.leadObj = {
		name: "",
		description: "",
		contacts: {
			primary: "",
			secondary: "",
			email: ""
		},
		address: {
			city: "Hyderabad",
			state: "Telangana",
			country: "India",
			locality: "Kukatpally",
			address: "",
			pincode: ""
		},
		contactPerson: {
			firstName: "",
			lastName: "",
			mobile: "",
			gender: lookup.salutations[0]
		},
		propertyType: lookup.commercialPropertyTypes[0],
		propertyDetails: {
			numberOfRooms: '',
			size: lookup.commercialPropertySizes[0]
		},
		gst: "",
		invoicePrefix: "",
		engagementPhase: lookup.engagementPhases[0],
		notes: {
			note: ""
		},
		leadSource: "Laundrynerds"
	};
	$scope.uploadSuccess = null;
	$scope.disableButton = false;
	$scope.newLeadId = null;

	$scope.createLead = function () {
		$scope.uploadSuccess = null;
		$scope.disableButton = true;
		$scope.newLeadId = null;
		webservice.post("commercial/lead", $scope.leadObj).then(function (response) {
			if (response.status === 200 && response.data) {
				$scope.newLeadId = response.data.commercialLeadId;
				$scope.uploadSuccess = true;
				delete $sessionStorage["commercial/lead?isEnabled=true"];
			} else {
				$scope.uploadSuccess = false;
			}
		}, function (error) {
			$scope.uploadSuccess = false;
		}).finally(function () {
			$scope.disableButton = false;
		});
	};

	// Collapsible
	$('.child-tree-toggle').click(function () {
		$(this).parent().children('div.tree').toggle(200);
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
		$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
	});
}]);

laundrynerdsAdminControllers.controller('CommercialLeadsCtrl', ['$scope', '$sessionStorage', '$localStorage', 'util', 'lookup', 'webservice', 'leads', function ($scope, $sessionStorage, $localStorage, util, lookup, webservice, leads) {
	$scope.leadType = "active";
	$scope.errorMessage = "";
	$scope.searchText = "";
	$scope.util = util;

	$scope.leadsClickHandler = function (row) {
		row.isExpanded = !row.isExpanded;
	};

	$scope.getPhaseHistory = function (phases) {
		if (phases instanceof Array && phases.length) {
			return phases.join(' -> ');
		} else {
			return phases ? phases : '';
		}
	};

	$scope.optionChangeHandler = function (value) {
		loadLeads();
	};

	$scope.openCommentsSection = function (row, $event) {
		if (row.isExpanded) {
			$event.stopPropagation();
		}
		row.addingComments = true;
	};

	$scope.updatePhaseHandler = function (row) {
		if (row.engagementPhase && row.engagementPhase[0]) {
			webservice.put('commercial/lead/' + row._id, {
				phase: row.engagementPhase[row.engagementPhase.length - 1]
			}).then(function (response) {
				if (response.status === 200 && response.data) {
					delete $sessionStorage["commercial/lead?isEnabled=true"];
					row.engagementPhase = response.data.engagementPhase;
					loadLeads();
				} else {
					row.errorMessage = "Error saving phase";
				}
			}, function (error) {
				row.errorMessage = "Error saving phase";
			});
		}
	};

	$scope.addPickupAddressHandler = function (row, $event) {
		$scope.leadForAddress = row;
		$scope.pickupAddresses = (row.pickupAddresses && row.pickupAddresses.length) ? row.pickupAddresses.slice(0) : [{
			"propertyName": "",
			"address": "",
			"invoicePrefix": ""
		}];
		$('#addressesModal').modal('show');
		$event.stopPropagation();
	};

	$scope.saveComment = function (row) {
		if (row.newComment) {
			webservice.put('commercial/lead/' + row._id, {
				note: row.newComment
			}).then(function (response) {
				if (response.status === 200 && response.data) {
					delete $sessionStorage["commercial/lead?isEnabled=true"];
					row.notes = response.data.notes;
				} else {
					row.errorMessage = "Error saving comment";
				}
			}, function (error) {
				row.errorMessage = "Error saving comment";
			}).finally(function () {
				row.addingComments = false;
			});
		}
	};

	$scope.cancelComment = function (row) {
		row.addingComments = false;
		row.newComment = null;
	};

	$scope.addPricelist = function (row, $event) {
		$scope.leadForPricelist = row;
		$scope.pricelist = (row.pricelist && row.pricelist.length) ? row.pricelist.slice(0) : [{
			"itemName": "",
			"price": 0
		}];
		$scope.copyPricelistFrom = null;
		$('#pricelistModal').modal('show');
		$event.stopPropagation();
	};

	$scope.addItem = function (type) {
		if (type === "pricelist") {
			$scope.pricelist.push({
				"itemName": "",
				"price": 0
			});
		} else if (type === "addresses") {
			$scope.pickupAddresses.push({
				"propertyName": "",
				"address": "",
				"invoicePrefix": ""
			});
		}
	};

	$scope.removeItem = function (entity, index) {
		entity.splice(index, 1);
	};

	$scope.removeOrderItem = function (index, items) {
		items.splice(index, 1);
	};

	$scope.copyFromChangeHandler = function () {
		$scope.pricelist = JSON.parse($scope.copyPricelistFrom).pricelist;
	};

	$scope.udpatePickupAddressesHandler = function () {
		if ($scope.pickupAddresses && $scope.pickupAddresses.length) {
			$scope.leadForAddress.errorMessage = "";
			webservice.put('commercial/lead/' + $scope.leadForAddress._id, {
				pickupAddresses: $scope.pickupAddresses
			}).then(function (response) {
				if (response.status === 200 && response.data) {
					delete $sessionStorage["commercial/lead?isEnabled=true"];
					$scope.leadForAddress.pickupAddresses = response.data.pickupAddresses;
				} else {
					$scope.leadForAddress.errorMessage = "Error saving pickup addresses";
				}
			}, function (error) {
				$scope.leadForAddress.errorMessage = "Error saving pickup addresses";
			}).finally(function () {
				$('#addressesModal').modal('hide');
			});
		}
	};

	$scope.udpatePricelistHandler = function () {
		if ($scope.pricelist && $scope.pricelist.length) {
			$scope.leadForPricelist.errorMessage = "";
			webservice.put('commercial/lead/' + $scope.leadForPricelist._id, {
				pricelist: $scope.pricelist
			}).then(function (response) {
				if (response.status === 200 && response.data) {
					delete $sessionStorage["commercial/lead?isEnabled=true"];
					$scope.leadForPricelist.pricelist = response.data.pricelist;
				} else {
					$scope.leadForPricelist.errorMessage = "Error saving pricelist";
				}
			}, function (error) {
				$scope.leadForPricelist.errorMessage = "Error saving pricelist";
			}).finally(function () {
				$('#pricelistModal').modal('hide');
			});
		}
	};

	var today = new Date();
	var defaultDeliveryDate = new Date();
	var numberOfDaysToAdd = 2;
	defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + numberOfDaysToAdd);
	$scope.openOrdersSection = function (e, $event) {
		if (e.pricelist && e.pricelist.length === 0) {
			e.errorMessage = "No pricelist item available, please add some items first";
			$event.stopPropagation();
			return;
		}
		if (e.isExpanded) {
			$event.stopPropagation();
		}
		e.isAddingOrder = true;
		e.order = {};
		e.order.pickupDate = today;
		e.order.deliveryDate = defaultDeliveryDate;
		e.order.pickedUpBy = $localStorage.pickedUpBy ? $localStorage.pickedUpBy : "";
		e.order.pickupAddress = "";
		refreshSelectPicker('.leads-order-items-' + e._id);
		if (e.pickupAddresses && e.pickupAddresses.length) {
			refreshSelectPicker('.leads-pickup-addresses-' + e._id);
			e.order.pickupAddress = e.pickupAddresses[0].propertyName;
		}
		e.order.items = [];
		$scope.addOrderItem(e);
	};

	$scope.addOrderItem = function (row) {
		var ls = $localStorage[row._id + (row.order.pickupAddress ? "-" + row.order.pickupAddress : "")];
		row.order.items.push({
			itemName: (ls && ls.length) ? ls[row.order.items.length] : row.pricelist[0].itemName,
			quantity: 0
		});
		refreshSelectPicker('.leads-order-items-' + row._id);
	};

	$scope.createLeadsOrder = function (row) {
		row.orderErrorMessage = "";
		row.errorMessage = "";
		if (row.order && row.order.items && row.order.items.length) {
			row.order.totalQty = 0;
			for (var i = 0; i < row.order.items.length; i++) {
				if (row.order.items[i].itemName === "") {
					row.orderErrorMessage = "Order item name cannot be empty";
					return;
				} else {
					row.order.totalQty += row.order.items[i].quantity;
				}
			}
			row.order.orderStatus = lookup.orderStatuses[1];
			row.order.commercialLeadId = row._id;

			// Save in local storage
			$localStorage.pickedUpBy = row.order.pickedUpBy;
			var localStValue = $localStorage[row.order.commercialLeadId + (row.order.pickupAddress ? "-" + row.order.pickupAddress : "")];
			if(!localStValue || (localStValue && localStValue.length < row.order.items.length)) {
				$localStorage[row.order.commercialLeadId + (row.order.pickupAddress ? "-" + row.order.pickupAddress : "")] = row.order.items.map((rec) => rec.itemName);
			}

			webservice.post('commercial/order', row.order).then(function (response) {
				if (response.status === 200 && response.data) {
					row.isAddingOrder = false;
					row.order = null;
					row.errorMessage = "Order added successfully";
				} else {
					row.orderErrorMessage = "Error saving order.";
				}
			}, function (error) {
				row.errorMessage = "Error saving order.";
			});
		} else {
			row.orderErrorMessage = "At least one item has to be added in order.";
		}
	};

	var refreshSelectPicker = function (className) {
		setTimeout(function () {
			$(className).selectpicker();
		}, 1);
	};

	var loadLeads = function () {
		//$scope.leads = [];
		$scope.errorMessage = "";
		webservice.fetchLeads($scope.leadType === 'active' ? true : false).then(function (leads) {
			if (leads.data && leads.data.length) {
				$scope.leads = leads.data;
				$scope.$apply();
			} else {
				$scope.leads = [];
				$scope.$apply();
			}
		}, function (error) {
			$scope.errorMessage = "Error loading leads.";
		});
	};

	if (leads.status === 200 && leads.data && leads.data.length > 0) {
		$scope.leads = leads.data;
	} else if (leads.status === 401 && leads.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.leads = [];
	}
}]);

laundrynerdsAdminControllers.controller('CommercialOrdersCtrl', ['$scope', 'util', 'lookup', 'webservice', 'orders', function ($scope, util, lookup, webservice, orders) {
	$scope.util = util;
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
		var commercialOrderObj = {
			orderStatus: row.orderStatus
		};
		var btnId = "#update-order-btn-" + row._id;
		var $btn = $(btnId).button('loading');
		webservice.put('commercial/order/' + row._id, commercialOrderObj).then(function (response) {
			$btn.button('complete');
			util.resetButtonWithDelay(btnId);
		}, function (error) {
			$btn.button('error');
			util.resetButtonWithDelay(btnId);
		});
	};

	if (orders.status === 200 && orders.data && orders.data.length > 0) {
		$scope.orders = orders.data;
	} else if (orders.status === 401 && orders.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.orders = [];
	}
}]);

laundrynerdsAdminControllers.controller('CommercialBillingCtrl', ['$scope', '$filter', '$http', '$localStorage', 'webservice', 'util', 'leads', function ($scope, $filter, $http, $localStorage, webservice, util, leads) {
	var today = new Date();
	var defaultStartDate = new Date();
	var numberOfDaysToAdd = -30;
	defaultStartDate.setDate(defaultStartDate.getDate() + numberOfDaysToAdd);

	$scope.durations = ["Last Month", "This Month", "Manual"];
	$scope.selectedDuration = $localStorage.durationForBilling ? $localStorage.durationForBilling : $scope.durations[0];
	$scope.dateSelectionDisabled = true;
	$scope.startDate = defaultStartDate;
	$scope.endDate = today;
	$scope.today = today;
	$scope.pickupAddress = "";
	numberOfDaysToAdd = 7;
	$scope.defaultPaymentDate = new Date();
	$scope.defaultPaymentDate.setDate($scope.defaultPaymentDate.getDate() + numberOfDaysToAdd);
	$scope.errorMessage = "";

	var generateBilling = function (orders) {
		$scope.bills = [];
		$scope.totalAmount = 0;
		var allPricelist = $scope.selectedLead.pricelist;
		var allPricelistObj = {};
		for (var i = 0; i < allPricelist.length; i++) {
			allPricelistObj[allPricelist[i].itemName] = allPricelist[i].price;
		}
		$scope.availablePricelistObj = {};
		$scope.totalAvailablePricelist = 0;
		var orderObj;
		orders.forEach(function (order, index) {
			orderObj = {};
			orderObj.pickupDate = util.parseJsonDate(order.pickupDate);
			orderObj.items = [];
			order.items.forEach(function (item, i) {
				if (!$scope.availablePricelistObj.hasOwnProperty(item.itemName)) {
					$scope.availablePricelistObj[item.itemName] = allPricelistObj[item.itemName];
					$scope.totalAvailablePricelist++;
				}
				var index = Object.keys($scope.availablePricelistObj).indexOf(item.itemName);
				var lineTotal = item.quantity * allPricelistObj[item.itemName];
				if (orderObj.items[index] && item.quantity > 0) {
					orderObj.items[index] = {
						"quantity": orderObj.items[index].quantity + item.quantity,
						"totalPrice": Math.round(lineTotal + orderObj.items[index].totalPrice * 100) / 100
					};
				} else {
					orderObj.items[index] = {
						"quantity": item.quantity,
						"totalPrice": Math.round(lineTotal * 100) / 100
					};
				}

				$scope.totalAmount += lineTotal;
			});
			$scope.bills.push(orderObj);
		});
	};

	var generateInvoicePricelistObj = function (orders) {
		var allPricelist = $scope.selectedLead.pricelist;
		var allPricelistObj = {};
		for (var i = 0; i < allPricelist.length; i++) {
			allPricelistObj[allPricelist[i].itemName] = allPricelist[i].price;
		}
		$scope.invoicePricelistObj = {};
		orders.forEach(function (order, index) {
			order.items.forEach(function (item, i) {
				var lineTotal = item.quantity * allPricelistObj[item.itemName];
				if (!$scope.invoicePricelistObj.hasOwnProperty(item.itemName)) {
					$scope.invoicePricelistObj[item.itemName] = {};
					$scope.invoicePricelistObj[item.itemName].quantity = item.quantity;
					$scope.invoicePricelistObj[item.itemName].amount = lineTotal;
					$scope.invoicePricelistObj[item.itemName].price = allPricelistObj[item.itemName];
				} else {
					$scope.invoicePricelistObj[item.itemName].quantity += item.quantity;
					$scope.invoicePricelistObj[item.itemName].amount += lineTotal;
				}
			});
		});
	};

	$scope.getInvoiceLink = function () {
		var url = window.location.origin + '/admin/commercial-invoice.html?lead=' + $scope.selectedLead._id + '&start=' + $scope.startDate.toDateString() + '&end=' + $scope.endDate.toDateString();
		if ($scope.pickupAddress) {
			url += '&pickupAddress=' + $scope.pickupAddress.propertyName;
		}
		return url;
	};

	$scope.leadChangeHandler = function () {
		$localStorage.leadForBilling = $scope.selectedLead;
		if ($scope.selectedLead.pickupAddresses && $scope.selectedLead.pickupAddresses.length) {
			$scope.pickupAddress = $scope.selectedLead.pickupAddresses[0];
			util.refreshSelectPicker('.leads-pickup-address');
		} else {
			$scope.pickupAddress = "";
		}
	};

	$scope.durationChangeHandler = function () {
		$localStorage.durationForBilling = $scope.selectedDuration;
		let month = today.getMonth();
		let year = today.getFullYear();
		switch ($scope.selectedDuration) {
			case "Last Month":
				$scope.startDate = new Date(year, month - 1, 1);
				$scope.endDate = month == 0 ? new Date(year - 1, 12, 0) : new Date(year, month, 0);
				$scope.dateSelectionDisabled = true;
				break;
			case "This Month":
				$scope.startDate = new Date(year, month, 1);
				$scope.endDate = month == 0 ? new Date(year, month + 1, 0) : new Date(year, month + 1, 0);
				$scope.dateSelectionDisabled = true;
				break;
			default:
				$scope.dateSelectionDisabled = false;
				break;
		}
	};

	$scope.loadBillingDetails = function () {
		$scope.errorMessage = "";
		$scope.bills = [];
		$scope.startDate.setHours(0, 0, 0, 0);
		$scope.endDate.setHours(23, 59, 59, 999);
		if (!$scope.selectedLead._id) {
			$scope.errorMessage = "Please select a lead, it cannot be empty.";
			return;
		} else if ($scope.endDate < $scope.startDate) {
			$scope.errorMessage = "Billing start date cannot be before end date.";
			return;
		}
		var reqObj = {
			startDate: $scope.startDate,
			endDate: $scope.endDate,
			pickupAddress: $scope.pickupAddress ? $scope.pickupAddress.propertyName : ""
		};
		webservice.post('commercial/lead/' + $scope.selectedLead._id + '/orders', reqObj).then(function (response) {
			if (response.status === 200 && response.data && response.data.orders && response.data.orders.length) {
				generateBilling(response.data.orders);
				generateInvoicePricelistObj(response.data.orders);
			} else {
				$scope.errorMessage = "No bills available for selected combination.";
			}
		}, function (error) {
			$scope.errorMessage = "Error loading bill, please try after sometime.";
		});
	};

	$scope.downloadInvoice = function () {
		$scope.disableDownloadButton = true;
		var invoiceName = util.getInvoicePrefix($scope.selectedLead, $scope.pickupAddress) + $scope.startDate.getDate() + $scope.startDate.getMonth();
		var reqObj = {
			invoice: {
				invoiceName: invoiceName,
				duration: $filter('date')($scope.startDate, "MMM-dd") + ' to ' + $filter('date')($scope.endDate, "MMM-dd, yyyy"),
				today: $filter('date')($scope.today, "MMM-dd, yyyy"),
				defaultPaymentDate: $filter('date')($scope.defaultPaymentDate, "MMM-dd, yyyy"),
				totalAmountWithoutGst: $scope.totalAmount
			},
			lead: {
				name: $scope.selectedLead.name,
				selectedPickupAddress: $scope.pickupAddress ? $scope.pickupAddress.address : ($scope.selectedLead.address.address + ', ' + $scope.selectedLead.address.locality + ', ' + $scope.selectedLead.address.city + ($scope.selectedLead.address.pincode ? (' - ' + $scope.selectedLead.address.pincode) : '')),
				gst: $scope.selectedLead.gst,
				availablePricelistObj: $scope.invoicePricelistObj
			}
		};

		var reqConfig = {
			dataType: "binary",
			processData: false,
			responseType: 'arraybuffer',
			headers: {
				"X-AUTH-TOKEN": "my-token",
				Accept: "*/*",
			}
		};
		var $btn = $("#download-invoice");
		$btn.button('loading');
		webservice.post('download/commercial', reqObj, reqConfig).then(function (response, status, xhr) {
			if (response.status === 200) {
				var blob = new Blob([response.data], {
					type: "application/octet-stream"
				});
				var url = URL.createObjectURL(blob);
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				a.href = url;
				a.download = $scope.selectedLead.name + ($scope.pickupAddress ? (' - ' + $scope.pickupAddress.propertyName) : '') +  '.pdf';
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				$scope.errorMessage = "Download not available, please try after sometime.";
			}
			$btn.button('reset');
			$scope.disableDownloadButton = false;
		});
	};

	if (leads.status === 200 && leads.data && leads.data.length > 0) {
		$scope.leads = leads.data;
		$scope.selectedLead = $localStorage.leadForBilling ? $scope.leads.find((rec) => {
			return rec.name === $localStorage.leadForBilling.name
		}) : $scope.leads[0];
		$scope.leadChangeHandler();
		$scope.durationChangeHandler();
	} else if (leads.status === 401 && leads.statusText === "Unauthorized") {
		window.location = "login.html";
	} else {
		$scope.leads = [];
	}
	util.refreshSelectPicker('.lead-name');
	util.refreshSelectPicker('.duration-names');
}]);

laundrynerdsAdminControllers.controller('CommercialInvoiceCtrl', ['$scope', '$filter', 'webservice', 'util', function ($scope, $filter, webservice, util) {
	$scope.util = util;
	$scope.today = new Date();
	numberOfDaysToAdd = 7;
	$scope.defaultPaymentDate = new Date();
	$scope.defaultPaymentDate.setDate($scope.defaultPaymentDate.getDate() + numberOfDaysToAdd);
	$scope.errorMessage = "";
	$scope.selectedPickupAddress = "";
	var generateInvoice = function (orders) {
		$scope.bills = [];
		$scope.totalAmountWithoutGst = 0;
		var allPricelist = $scope.lead.pricelist;
		var allPricelistObj = {};
		for (var i = 0; i < allPricelist.length; i++) {
			allPricelistObj[allPricelist[i].itemName] = allPricelist[i].price;
		}
		$scope.availablePricelistObj = {};
		orders.forEach(function (order, index) {
			order.items.forEach(function (item, i) {
				var lineTotal = item.quantity * allPricelistObj[item.itemName];
				if (!$scope.availablePricelistObj.hasOwnProperty(item.itemName)) {
					$scope.availablePricelistObj[item.itemName] = {};
					$scope.availablePricelistObj[item.itemName].quantity = item.quantity;
					$scope.availablePricelistObj[item.itemName].amount = lineTotal;
					$scope.availablePricelistObj[item.itemName].price = allPricelistObj[item.itemName];
				} else {
					$scope.availablePricelistObj[item.itemName].quantity += item.quantity;
					$scope.availablePricelistObj[item.itemName].amount += lineTotal;
				}

				$scope.totalAmountWithoutGst += lineTotal;
			});
		});
		$scope.gst = $scope.totalAmountWithoutGst * 9 / 100;
		$scope.totalAmount = $scope.totalAmountWithoutGst + (2 * $scope.gst);
		$scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
	};

	$scope.getInvoiceName = function (lead) {
		if (lead) {
			return util.getInvoicePrefix(lead, $scope.selectedPickupAddress) + $scope.startDate.getDate() + $scope.startDate.getMonth();
		}
	};

	$scope.downloadInvoice = function () {
		$scope.disableDownloadButton = true;
		var invoiceName = util.getInvoicePrefix($scope.lead, $scope.selectedPickupAddress) + $scope.startDate.getDate() + $scope.startDate.getMonth();
		var reqObj = {
			invoice: {
				invoiceName: invoiceName,
				duration: $filter('date')($scope.startDate, "MMM-dd") + ' to ' + $filter('date')($scope.endDate, "MMM-dd, yyyy"),
				today: $filter('date')($scope.today, "MMM-dd, yyyy"),
				defaultPaymentDate: $filter('date')($scope.defaultPaymentDate, "MMM-dd, yyyy"),
				totalAmountWithoutGst: $scope.totalAmountWithoutGst
			},
			lead: {
				name: $scope.lead.name,
				selectedPickupAddress: $scope.selectedPickupAddress ? $scope.selectedPickupAddress.address : ($scope.lead.address.address + ', ' + $scope.lead.address.locality + ', ' + $scope.lead.address.city + ($scope.lead.address.pincode ? (' - ' + $scope.lead.address.pincode) : '')),
				gst: $scope.lead.gst,
				availablePricelistObj: $scope.availablePricelistObj
			}
		};

		var reqConfig = {
			dataType: "binary",
			processData: false,
			responseType: 'arraybuffer',
			headers: {
				"X-AUTH-TOKEN": "my-token",
				Accept: "*/*",
			}
		};
		var $btn = $("#download-invoice");
		webservice.post('download/commercial', reqObj, reqConfig).then(function (response, status, xhr) {
			if (response.status === 200) {
				var blob = new Blob([response.data], {
					type: "application/octet-stream"
				});
				var url = URL.createObjectURL(blob);
				//window.open(objectUrl, 'abc');
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				a.href = url;
				a.download = $scope.lead.name + '.pdf';
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				$scope.errorMessage = "Download not available, please try after sometime.";
			}
			$scope.disableDownloadButton = false;
		});
	};

	$scope.fetchOrderDetails = function () {
		$scope.errorMessage = "";
		var reqObj = {
			startDate: $scope.startDate,
			endDate: $scope.endDate,
			pickupAddress: $scope.pickupAddress ? $scope.pickupAddress : '',
			leadDetailsRequired: true
		};
		webservice.post('commercial/lead/' + $scope.leadId + '/orders', reqObj).then(function (response) {
			if (response.status === 200 && response.data && response.data.orders && response.data.orders.length) {
				$scope.lead = response.data.lead;

				// Get sub address
				if ($scope.pickupAddress && $scope.lead.pickupAddresses && $scope.lead.pickupAddresses.length) {
					$scope.lead.pickupAddresses.forEach(function (value) {
						if ($scope.pickupAddress === value.propertyName) {
							$scope.selectedPickupAddress = value;
							return true;
						}
					});
				}

				generateInvoice(response.data.orders);
			} else {
				$scope.errorMessage = "No bills available for selected combination.";
			}
		}, function (error) {
			$scope.errorMessage = "Error loading bill, please try after sometime.";
		});
	};

	(function () {
		$scope.leadId = util.getUrlParameter("lead");
		var pickupAddress = util.getUrlParameter("pickupAddress");
		$scope.pickupAddress = pickupAddress ? decodeURIComponent(pickupAddress) : "";
		$scope.startDate = new Date(decodeURIComponent(util.getUrlParameter("start")));
		$scope.endDate = new Date(decodeURIComponent(util.getUrlParameter("end")));
		$scope.startDate.setHours(0, 0, 0, 0);
		$scope.endDate.setHours(23, 59, 59, 999);
		$scope.fetchOrderDetails();
	})();
}]);

// Report Controllers
laundrynerdsAdminControllers.controller('DashboardCtrl', ['$scope', 'webservice', 'lookup', function ($scope, webservice, lookup) {
	var chartDataLoader = function (reportObj) {
		var url = 'report/' + reportObj.urlSuffix + '/dashboard/';

		webservice.get(url).then(function (response) {
			if (response.data && response.data.length) {
				reportObj.errorMessage = "";
				reportObj.isError = false;
				reportObj.labels = response.data.map((rec) => lookup.months[rec._id.month - 1] + " - " + rec._id.year);
				reportObj.data = [response.data.map((rec) => rec.count)];
			} else {
				reportObj.errorMessage = "No data available.";
				reportObj.isError = true;
			}
			reportObj.isLoading = false;
		}, function (error) {
			reportObj.errorMessage = "Error loading report";
			reportObj.isError = true;
			reportObj.isLoading = false;
		});
	};

	$scope.reports = [{
		urlSuffix: "customers",
		title: "Monthly Customers",
		isLoading: true,
		errorMessage: "",
		isError: false,
		data: "",
		labels: "",
		series: ["# of customers"],
		size: 'half'
	}, {
		urlSuffix: "orders",
		title: "Monthly Online Orders",
		isLoading: true,
		errorMessage: "",
		isError: false,
		data: "",
		labels: "",
		series: ["# of orders"],
		size: 'half'
	}];

	$scope.reports.forEach(function(obj) {
		chartDataLoader(obj);
	});
}]);

$('.tree-toggle').click(function () {
	$(this).parent().children('ul.tree').toggle(200);
	$(this).children('.glyphicon').toggleClass("glyphicon-chevron-down");
	$(this).children('.glyphicon').toggleClass("glyphicon-chevron-right");
});