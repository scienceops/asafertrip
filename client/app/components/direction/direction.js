(function () {
    'use strict';

	angular.module('asafertrip')
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/', {
				templateUrl: '/components/direction/direction.html',
				controller: 'DirectionController',
				controllerAs: 'directionCtrl'
			}).otherwise({redirectTo: '/'});

		}]);
})();