%%angular_app_name%%.directive('body', ['$location', function($location) {
	return {
		restrict: 'E',
		link: function(scope, elem, attrs) {
			if ($location.path() == '/') {
				elem.addClass('trainjs-intro');
			} else {
				elem.addClass('');
			}
		}
	};
}]);
