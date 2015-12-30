var alertDirective = angular.module('alertDirective', []);

alertDirective.directive('notice', ['flashHelper', function(flashHelper) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			var notice = flashHelper.get();
			elem.text(notice);
		}
	};
}]);
