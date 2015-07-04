(function () {
    'use strict';

	angular.module('asafertrip')
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/music', {
				templateUrl: '/components/music/music.html',
				controller: 'MusicController',
				controllerAs: 'musicCtrl'
			});

		}]);
})();

