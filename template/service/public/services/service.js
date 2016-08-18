var %%model_module%% = angular.module('%%model_module%%', ['ngResource']);

%%model_module%%.factory('%%model_name%%', ['$resource', function($resource){
	return $resource('%%model_plural%%/:id', {id:'@id'}, {
%%service_resources%%
	});
}]);
