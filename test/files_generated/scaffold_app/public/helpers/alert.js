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

alertHelper.factory('scaffoldHelper', function() {
	return {
		errors: function(errors, model_name) {
			var messages = [];
			for(var i in errors) {
				var elem = document.querySelectorAll('form[form-for] .field [attribute="'+errors[i].path+'"]')[0];
				if (!angular.element(elem).parent().hasClass('field_with_errors'))
					angular.element(elem).parent().addClass('field_with_errors');
				messages.push(errors[i].message);
			}

			var error_explanation = angular.element('<div id="error_explanation"></div>');
			if ( document.getElementById('error_explanation') ) {
				error_explanation = angular.element( document.getElementById('error_explanation') );
			} else {
				angular.element( document.querySelectorAll('form[form-for]')[0] ).prepend(error_explanation);
			}
			error_explanation.html('<h2>'+errors.length+' error prohibited this '+model_name+' from being saved:</h2>');
			var ul_html = '<ul>';
			for(var i in messages) {
				ul_html += '<li>'+messages[i]+'</li>';
			}
			ul_html += '</ul>';
			error_explanation.append(ul_html);
		}
	}
});
