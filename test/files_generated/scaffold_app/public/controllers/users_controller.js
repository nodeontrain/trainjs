'use strict';

var usersController = angular.module('usersController', []);

usersController.controller(
	'UsersCtrl',
	['$scope', '$state', 'users', 'User', 'flashHelper', function ($scope, $state, users, User, flashHelper) {
		$scope.users = users;
		$scope.deleteUser = function(id) {
			if (window.confirm('Are you sure?')) {
				User.delete({id: id}, function() {
					flashHelper.set('User was successfully destroyed.');
					$state.transitionTo($state.current, {}, {
						reload: true, inherit: false, notify: true
					});
				});
			}
		};
	}]
);

usersController.controller(
	'UserFormCtrl',
	['$scope', '$state', 'User', 'flashHelper', 'user', function ($scope, $state, User, flashHelper, user) {
		$scope.user = user;
		var service = 'create';
		var message = 'User was successfully created.';
		$scope.title = 'New User';
		$scope.submit_button_label = 'Create User';
		if ($scope.user.id) {
			service = 'update';
			message = 'User was successfully updated.';
			$scope.title = 'Editing User';
			$scope.submit_button_label = 'Update User';
		}

		$scope.saveUser = function() {
			User[service]($scope.user, function(user){
				flashHelper.set(message);
				$state.transitionTo('user_detail', {id: user.id}, {
					reload: true, inherit: false, notify: true
				});
			});
		};
	}]
);

usersController.controller(
	'UsersDetailCtrl',
	['$scope', 'user', 'flashHelper', function ($scope, user, flashHelper) {
		$scope.user = user;
	}]
);
