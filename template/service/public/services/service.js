var %%model%%Service = angular.module('%%model%%Service', ['ngResource']);

%%model%%Service.factory('%%model_name%%', ['$resource', function($resource){
	return $resource('%%model_plural%%/:id', {id:'@id'}, {
%%service_resources%%
	});
}]);
