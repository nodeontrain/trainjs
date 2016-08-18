var userService = angular.module('userService', ['ngResource']);

userService.factory('User', ['$resource', function($resource){
	return $resource('users/:id', {id:'@id'}, {
		'get':    {method:'GET'},
		'create': {method:'POST'},
		'update': {method:'PUT'},
		'query':  {method:'GET', isArray:true},
		'delete': {method:'DELETE'}
	});
}]);
