var alertHelper = angular.module('alertHelper', []);

alertHelper.factory('flashHelper', ['$rootScope', function($rootScope) {
	var queue = [], currentMessage = '';

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if (queue.length > 0)
			currentMessage = queue.shift();
		else
			currentMessage = '';
	});

	return {
		set: function(message) {
			queue.push(message);
		},
		get: function() {
			return currentMessage;
		}
	};
}]);
