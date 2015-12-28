'use strict';

var %%model_plural%%Controller = angular.module('%%model_plural%%Controller', []);

%%model_plural%%Controller.controller(
	'%%controller_name%%Ctrl',
	['$scope', '$state', '%%model_plural%%', '%%model_name%%', 'flashHelper', function ($scope, $state, %%model_plural%%, %%model_name%%, flashHelper) {
		$scope.%%model_plural%% = %%model_plural%%;
		$scope.delete%%model_name%% = function(id) {
			if (window.confirm('Are you sure?')) {
				%%model_name%%.delete({id: id}, function() {
					flashHelper.set('%%model_name%% was successfully destroyed.');
					$state.transitionTo($state.current, {}, {
						reload: true, inherit: false, notify: true
					});
				});
			}
		};
	}]
);

%%model_plural%%Controller.controller(
	'%%model_name%%FormCtrl',
	['$scope', '$state', '%%model_name%%', 'flashHelper', '%%model%%', function ($scope, $state, %%model_name%%, flashHelper, %%model%%) {
		$scope.%%model%% = %%model%%;
		var service = 'create';
		var message = '%%model_name%% was successfully created.';
		$scope.title = 'New %%model_name%%';
		$scope.submit_button_label = 'Create %%model_name%%';
		if ($scope.%%model%%.id) {
			service = 'update';
			message = '%%model_name%% was successfully updated.';
			$scope.title = 'Editing %%model_name%%';
			$scope.submit_button_label = 'Update %%model_name%%';
		}

		$scope.save%%model_name%% = function() {
			%%model_name%%[service]($scope.%%model%%, function(%%model%%){
				flashHelper.set(message);
				$state.transitionTo('%%model%%_detail', {id: %%model%%.id}, {
					reload: true, inherit: false, notify: true
				});
			});
		};
	}]
);

%%model_plural%%Controller.controller(
	'%%controller_name%%DetailCtrl',
	['$scope', '%%model%%', 'flashHelper', function ($scope, %%model%%, flashHelper) {
		$scope.%%model%% = %%model%%;
	}]
);
