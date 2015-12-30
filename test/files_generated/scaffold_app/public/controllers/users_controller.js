'use strict';

var usersController = angular.module('usersController', []);

usersController.controller(
	'UsersCtrl',
	['$scope', '$state', 'flashHelper', 'users', 'User', function ($scope, $state, flashHelper, users, User) {
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
	['$scope', '$state', 'flashHelper', 'scaffoldHelper', 'User', 'user', function ($scope, $state, flashHelper, scaffoldHelper, User, user) {
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
				if ( user.errors ) {
					scaffoldHelper.errors(user.errors, 'user');
				} else {
					flashHelper.set(message);
					$state.transitionTo('user_detail', {id: user.id}, {
						reload: true, inherit: false, notify: true
					});
				}
			});
		};
	}]
);

usersController.controller(
	'UsersDetailCtrl',
	['$scope', 'flashHelper', 'user', function ($scope, flashHelper, user) {
		$scope.user = user;
	}]
);
