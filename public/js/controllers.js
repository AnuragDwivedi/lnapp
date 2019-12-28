/**
 * http://usejsdoc.org/
 */

var laundryNerdsControllers = angular.module('laundryNerdsControllers', ['ngCookies']);

laundryNerdsControllers.controller('ActiveNavigationLinksCtrl', ['$scope', 'webservice', function ($scope, webservice) {
	$scope.activeTab = "Home";
	$scope.changeActiveTab = function (tabName) {
		$scope.activeTab = tabName;
	};

	$scope.tryAPIGeolocation = function () {
		$.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDCa1LUe1vOczX1hO_iGYgyo8p_jYuGOPU", function (success) {
			$scope.browserGeolocationSuccess({
				coords: {
					latitude: success.location.lat,
					longitude: success.location.lng
				}
			});
		}).fail(function (err) {
			console.log("Unable to load location details");
		});
	};

	$scope.browserGeolocationFail = function (error) {
		if (error.code === 1) {
			$scope.tryAPIGeolocation();
		}
	};

	$scope.browserGeolocationSuccess = function (position) {
		var locationObj = {},
			lat = position.coords.latitude,
			lng = position.coords.longitude,
			latlng = new google.maps.LatLng(lat, lng);
		locationObj.latitude = lat;
		locationObj.longitude = lng;
		locationObj.address = {};

		geocoder.geocode({
			'latLng': latlng
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					//formatted address
					//alert(results[0].formatted_address);
					locationObj.address.fullAddress = results[0].formatted_address;
					//find country name
					for (var i = 0; i < results[0].address_components.length; i++) {
						for (var b = 0; b < results[0].address_components[i].types.length; b++) {
							//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
							if (results[0].address_components[i].types[b] == "sublocality_level_1") {
								locationObj.address.locality = results[0].address_components[i].long_name;
							} else if (results[0].address_components[i].types[b] == "locality") {
								locationObj.address.city = results[0].address_components[i].long_name;
							} else if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
								locationObj.address.state = results[0].address_components[i].long_name;
							} else if (results[0].address_components[i].types[b] == "country") {
								locationObj.address.country = results[0].address_components[i].long_name;
							} else if (results[0].address_components[i].types[b] == "postal_code") {
								//city= results[0].address_components[i];
								locationObj.address.postalCode = results[0].address_components[i].long_name;
							}
						}
					}
				} else {
					locationObj.address.fullAddress = "No address returned";
				}
			} else {
				//alert("Geocoder failed due to: " + status);
				locationObj.address.fullAddress = "Geocoder failed due to: " + status;
			}
			$scope.pageHit(locationObj);
		});
	};

	$scope.geoLocation = function () {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				$scope.browserGeolocationSuccess,
				$scope.browserGeolocationFail, {
					maximumAge: 50000,
					timeout: 20000,
					enableHighAccuracy: true
				});
		}
	}();

	$scope.pageHit = function (locationObj) {
		webservice.post('page', locationObj).then(function (response) {
			//console.log(response.data);
		}, function (error) {
			console.log(error);
		});
	};
}]);

laundryNerdsControllers.controller('ScheduleCtrl', ['$scope', 'webservice', function ($scope, webservice) {
	var today = new Date(),
		year = today.getFullYear(),
		month = today.getMonth(),
		date = today.getDate();
	$scope.today = today.toISOString();
	$scope.salutation = {
		options: ["Mr.", "Ms.", "Mrs."],
		selectedValue: "Mr."
	};
	$scope.fname = null;
	$scope.lname = null;
	$scope.mobile = null;
	$scope.email = null;
	$scope.area = {
		options: [
			"Madhapur", 
			"Hitec City", 
			"Kondapur", 
			"Kothaguda", 
			"Kukatpally", 
			"Gachibowli", 
			"Hafeezpet", 
			"Indira Nagar", 
			"Miyapur", 
			// "Peerancheru"
			"Lingampally", 
			"Nallagandla"
		],
		selectedValue: "",
		isValid: true,
		validationMessage: ""
	};
	$scope.address = null;
	$scope.pickUpDate = {
		selectedDate: null,
		minDate: today.toISOString(),
		isValid: true,
		validationMessage: ""
	};
	$scope.pickUpSlot = {
		options: ["Morning 8 to 10", "Morning 10 to 12", "Evening 4 to 6", "Evening 6 to 8"],
		selectedValue: "Evening 6 to 8"
	};

	$scope.closePopup = function () {
		$('#scheduleNowModel').modal('hide');
	};

	$scope.schedulePickUp = function () {
		$scope.pickUpDate.validationMessage = "";
		$scope.pickUpDate.isValid = true;
		var selectedDate = new Date($scope.pickUpDate.selectedDate);
		if (isNaN(selectedDate.getTime())) {
			$scope.pickUpDate.validationMessage = "Not a valid date, enter date in format yyyy-mm-dd";
			$scope.pickUpDate.isValid = false;
		} else if (selectedDate.getFullYear() <= year && selectedDate.getMonth() <= month && selectedDate.getDate() < date) {
			$scope.pickUpDate.validationMessage = "Start date can not be before today's date";
			$scope.pickUpDate.isValid = false;
		} else if(!$scope.area.selectedValue) {
			$scope.area.isValid = false;
			$scope.area.validationMessage = "Please choose a locality for the delivery";
		} else {
			$scope.pickUpDate.validationMessage = "";
			$scope.pickUpDate.isValid = true;
			// Set default delivery date => pickup date + 2
			var defaultDeliveryDate = new Date($scope.pickUpDate.selectedDate);
			var numberOfDaysToAdd = 2;
			defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + numberOfDaysToAdd);

			var generalOrderObj = {
				firstName: $scope.fname,
				lastName: $scope.lname,
				gender: $scope.salutation.selectedValue === "Mr." ? "M" : "F",
				mobile: $scope.mobile,
				email: $scope.email,
				pickupDate: $scope.pickUpDate.selectedDate,
				deliveryDate: defaultDeliveryDate,
				pickupSlot: $scope.pickUpSlot.selectedValue,
				locality: $scope.area.selectedValue,
				fullAddress: $scope.address,
				source: "Online",
			};

			webservice.post('generalorder', generalOrderObj).then(function (response) {
				$('#scheduleNowModel').modal('hide');
				window.scrollTo(0, 0);
				$("#order-success").show('slow');

				setTimeout(function () {
					$("#order-success").hide('slow');
				}, 5000);

				console.log(response.data);
			}, function (error) {
				$('#scheduleNowModel').modal('hide');
				window.scrollTo(0, 0);
				$("#order-error").show('slow');

				setTimeout(function () {
					$("#order-error").hide('slow');
				}, 5000);

				console.log(error);
			});
		}
	}
}]);

laundryNerdsControllers.controller('SubscribeCtrl', ['$scope', '$cookies', 'webservice', function ($scope, $cookies, webservice) {

	$scope.email = null;
	$scope.fullName = null;
	$scope.mobile = null;

	$scope.subscribeNow = function () {
		if ($cookies.get('subscribe.laundrynerds.com') !== $scope.email) {
			var subscribeObj = {
				email: $scope.email,
				fullName: $scope.fullName,
				mobile: $scope.mobile
			};

			webservice.post('page/subscribe', subscribeObj).then(function (response) {
				window.scrollTo(0, 0);
				$("#subscription-success").show('slow');

				setTimeout(function () {
					$("#subscription-success").hide('slow');
				}, 5000);

				console.log(response.data);
			}, function (error) {
				window.scrollTo(0, 0);
				$("#subscription-error").show('slow');

				setTimeout(function () {
					$("#subscription-success").hide('slow');
				}, 5000);

				console.log(error);
			});
		}
	};
}]);

laundryNerdsControllers.controller('PricelistCtrl', ['$scope', 'webservice', function ($scope, webservice) {
	$scope.subscriptions;
	$scope.pricelists;
	$scope.closePopup = function () {
		$('#pricelistModel').modal('hide');
	};
	$scope.menFilter = function (item) {
		if (item["itemName"].indexOf('-common') > 0 || item["itemName"].indexOf('-mens') > 0) {
			return true;
		}
	};
	$scope.womenFilter = function (item) {
		if (item["itemName"].indexOf('-common') > 0 || item["itemName"].indexOf('-ladies') > 0) {
			return true;
		}
	};
	$scope.kidsFilter = function (item) {
		if (item["itemName"].indexOf('-children') > 0) {
			return true;
		}
	};
	$scope.householdFilter = function (item) {
		if (item["itemName"].indexOf('-homewear') > 0) {
			return true;
		}
	};

	//		webservice.get('subscription?isEnabled=true').then(function (subscriptions) {
	//			if (subscriptions.data && subscriptions.data.length) {
	//				$scope.subscriptions = subscriptions.data;
	//			}
	//		}, function (error) {
	//			console.log("Error getting subscription" + error);
	//		});

	webservice.get('pricelist').then(function (pricelists) {
		if (pricelists.data && pricelists.data.length) {
			$scope.pricelists = pricelists.data;
		}
	}, function (error) {
		console.log("Error getting pricelist" + error);
	});
}]);

laundryNerdsControllers.controller('TermsAndConditionsCtrl', ['$scope', function ($scope) {
	$scope.closePopup = function () {
		$('#tcModel').modal('hide');
	};
}]);

laundryNerdsControllers.controller('BannerCtrl', ['$scope', function ($scope) {
	$scope.closePopup = function () {
		$('#superEconomyModal').modal('hide');
	};
}]);

laundryNerdsControllers.controller('GoonjCtrl', ['$scope', function ($scope) {
	$scope.closePopup = function () {
		$('#goonjModal').modal('hide');
	};
}]);
