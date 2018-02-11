var laundrynerdsDirectives = angular.module("laundrynerdsDirectives", []);

laundrynerdsDirectives.directive("confirmpopup", function () {
	return {
		templateUrl: "../admin/directives/confirmPopup.html",
		replace: true,
		restrict: 'E',
		scope: false, //default
		link: function (scope, element, attrs) {
			scope.closeAndCancel = function () {
				$('#confirmModal').modal('hide');
				scope.confirmClickHandler();
			};
			scope.params = attrs.params.messageObj;
		}
	}
});
