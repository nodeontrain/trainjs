'use strict';

var sampleApp = angular.module('sampleApp', [
	'ui.router',
	'staticPagesController',
	'bodyDirective',
	'headDirective'
]);

sampleApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
	.state('static_pages_help', {
		url: '/static_pages/help',
		templateUrl: 'partials/static_pages/help.html',
		controller: 'StaticPagesHelpCtrl'
	})
	.state('static_pages_home', {
		url: '/static_pages/home',
		templateUrl: 'partials/static_pages/home.html',
		controller: 'StaticPagesHomeCtrl'
	})
	.state('root', {
		url: '/',
		templateUrl: 'partials/index.html'
	})
}]);

// Disable Template Caching Angular UI
sampleApp.config(['$provide', function ($provide) {
	// Set a suffix outside the decorator function
	var cacheBuster = Date.now().toString();
	$provide.decorator('$templateFactory', ['$delegate', function ($delegate) {
		var fromUrl = angular.bind($delegate, $delegate.fromUrl);
		$delegate.fromUrl = function (url, params) {
			if (url !== null && angular.isDefined(url) && angular.isString(url)) {
				url += (url.indexOf("?") === -1 ? "?" : "&");
				url += "v=" + cacheBuster;
			}
			return fromUrl(url, params);
		};
		return $delegate;
	}]);
}]);

sampleApp.config(['$provide', function($provide) {
	$provide.decorator('$state', ['$delegate', '$rootScope', function($delegate, $rootScope) {
		$rootScope.$on('$stateChangeStart', function(event, state, params) {
			$delegate.next = state;
			$delegate.toParams = params;
		});
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			$delegate.previous = fromState;
			$delegate.fromParams = fromParams;
		});
		return $delegate;
	}]);
}]);

sampleApp.run(['$rootScope', function($rootScope) {

}]);
